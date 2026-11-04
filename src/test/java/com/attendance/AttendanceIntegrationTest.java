package com.attendance;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestBuilders.formLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:test;DB_CLOSE_DELAY=-1", "attendance.seed-demo=false"})
@AutoConfigureMockMvc
class AttendanceIntegrationTest {
    @Autowired AttendanceService service;
    @Autowired JdbcTemplate db;
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @BeforeEach void clean() {
        db.update("DELETE FROM attendance");db.update("DELETE FROM employees");
        db.update("UPDATE settings SET start_time='09:00',end_time='18:00',threshold=0.50,location_enabled=FALSE,site_name='',site_latitude=NULL,site_longitude=NULL,site_radius=200 WHERE id=1");
    }
    long employee(String code) {
        service.addEmployee(Map.of("code",code,"name","测试成员","department","研发部","position","工程师"));
        return db.queryForObject("SELECT id FROM employees WHERE code=?",Long.class,code);
    }
    List<Double> face() { var result=new ArrayList<>(Collections.nCopies(128,0.01)); result.set(0,0.5); return result; }
    @Test void authenticationAndCsrfAreRequired() throws Exception {
        mvc.perform(get("/api/employees")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/employees").with(user("admin")).contentType("application/json").content("{}" )).andExpect(status().isForbidden());
        mvc.perform(get("/api/employees").with(user("admin"))).andExpect(status().isOk());
        mvc.perform(formLogin("/login").user("admin").password("Admin@2026")).andExpect(status().isFound()).andExpect(redirectedUrl("/"));
    }
    @Test void faceEnrollmentRecognitionAndDuplicatePrevention() throws Exception {
        long id=employee("001");service.enroll(id,face());
        assertEquals(true,service.employees().get(0).get("enrolled"));
        assertEquals("签到成功",service.recognize(face(),"in").get("message"));
        assertThrows(IllegalArgumentException.class,()->service.recognize(face(),"in"));
        assertEquals("签退成功",service.recognize(face(),"out").get("message"));
        assertThrows(IllegalArgumentException.class,()->service.recognize(face(),"out"));
        assertEquals(1,db.queryForObject("SELECT COUNT(*) FROM attendance",Integer.class));
    }
    @Test void unknownAndDisabledEmployeesCannotCheckIn() throws Exception {
        long id=employee("002");service.enroll(id,face());
        var other=new ArrayList<>(face());other.set(0,-0.7);
        assertThrows(IllegalArgumentException.class,()->service.recognize(other,"in"));
        service.toggleEmployee(id,false);
        assertThrows(IllegalArgumentException.class,()->service.recognize(face(),"in"));
        assertEquals(0,db.queryForObject("SELECT COUNT(*) FROM attendance",Integer.class));
    }
    @Test void duplicateFacesAndInvalidDescriptorsAreRejected() throws Exception {
        long id=employee("003"),second=employee("004");service.enroll(id,face());
        assertThrows(IllegalArgumentException.class,()->service.enroll(second,face()));
        assertThrows(IllegalArgumentException.class,()->service.enroll(second,List.of(0.1)));
        assertThrows(IllegalArgumentException.class,()->service.enroll(second,Collections.nCopies(128,0.0)));
        assertThrows(IllegalArgumentException.class,()->service.recognize(face(),"invalid"));
    }
    @Test void settingsDriveLateAndEarlyStatusesAndResolutionPreservesThem() throws Exception {
        service.saveSettings(Map.of("start_time","00:00","end_time","23:59","threshold",0.5));
        long id=employee("005");service.enroll(id,face());service.recognize(face(),"in");service.recognize(face(),"out");
        assertEquals("迟到 / 早退",db.queryForObject("SELECT status FROM attendance",String.class));
        long record=db.queryForObject("SELECT id FROM attendance",Long.class);
        service.resolve(record,"已核实，外勤打卡");
        assertEquals(true,db.queryForObject("SELECT resolved FROM attendance",Boolean.class));
        assertEquals("迟到 / 早退",db.queryForObject("SELECT status FROM attendance",String.class));
        assertThrows(IllegalArgumentException.class,()->service.resolve(record,"重复处理"));
    }
    @Test void checkoutRequiresCheckinAndInvalidRulesAreRejected() throws Exception {
        long id=employee("006");service.enroll(id,face());
        assertThrows(IllegalArgumentException.class,()->service.recognize(face(),"out"));
        assertThrows(IllegalArgumentException.class,()->service.saveSettings(Map.of("start_time","18:00","end_time","09:00","threshold",0.5)));
        assertThrows(IllegalArgumentException.class,()->service.saveSettings(Map.of("start_time","09:00","end_time","18:00","threshold",0.99)));
    }
    @Test void employeeEndpointAndCsvExportWork() throws Exception {
        mvc.perform(post("/api/employees").with(user("admin")).with(csrf()).contentType("application/json").content(json.writeValueAsString(Map.of("code","007","name","=1+1","department","研发部","position","工程师")))).andExpect(status().isOk());
        long id=db.queryForObject("SELECT id FROM employees",Long.class);service.enroll(id,face());service.recognize(face(),"in");
        var today=java.time.LocalDate.now(AttendanceService.ZONE).toString();
        mvc.perform(get("/api/export").param("from",today).param("to",today).with(user("admin"))).andExpect(status().isOk()).andExpect(header().string("Content-Disposition","attachment; filename=attendance-"+today+".csv")).andExpect(content().string(org.hamcrest.Matchers.containsString("' =1+1".replace(" ",""))));
    }
    Map<String,Object> geoRules() {
        return new HashMap<>(Map.of("start_time","09:00","end_time","18:00","threshold",0.5,
            "location_enabled",true,"site_name","学校实验楼","site_latitude",31.2304,"site_longitude",121.4737,"site_radius",200));
    }
    LocationPolicy.Position position(double latitude,double longitude) {
        return new LocationPolicy.Position(latitude,longitude,10.0,System.currentTimeMillis());
    }
    @Test void locationSettingsAreValidatedAndOldClientsPreserveRestriction() {
        service.saveSettings(geoRules());
        service.saveSettings(Map.of("start_time","08:00","end_time","17:00","threshold",0.45));
        assertEquals(true,service.settings().get("location_enabled"));
        assertEquals("学校实验楼",service.settings().get("site_name"));
        for (var entry:Map.of("site_latitude",91,"site_longitude",181,"site_radius",9).entrySet()) {
            var invalid=geoRules();invalid.put(entry.getKey(),entry.getValue());
            assertThrows(IllegalArgumentException.class,()->service.saveSettings(invalid));
        }
        var invalid=geoRules();invalid.put("site_name","");
        assertThrows(IllegalArgumentException.class,()->service.saveSettings(invalid));
        invalid.put("site_name","实验楼");invalid.put("location_enabled","true");
        assertThrows(IllegalArgumentException.class,()->service.saveSettings(invalid));
        assertEquals("学校实验楼",service.settings().get("site_name"));
    }
    @Test void outOfRangeMissingAndUnreliableLocationsNeverCreateAttendance() throws Exception {
        long id=employee("GEO1");service.enroll(id,face());service.saveSettings(geoRules());
        long now=System.currentTimeMillis();
        assertThrows(IllegalArgumentException.class,()->service.recognize(face(),"in"));
        assertThrows(IllegalArgumentException.class,()->service.recognize(face(),"in",position(31.24,121.49)));
        for(var invalid:List.of(
            new LocationPolicy.Position(31.2304,121.4737,500.0,now),
            new LocationPolicy.Position(31.2304,121.4737,0.0,now),
            new LocationPolicy.Position(31.2304,121.4737,10.0,now-180000),
            new LocationPolicy.Position(31.2304,121.4737,10.0,now+180000),
            new LocationPolicy.Position(Double.NaN,121.4737,10.0,now),
            new LocationPolicy.Position(91.0,121.4737,10.0,now)))
            assertThrows(IllegalArgumentException.class,()->service.recognize(face(),"in",invalid));
        assertEquals(0,db.queryForObject("SELECT COUNT(*) FROM attendance",Integer.class));
    }
    @Test void locationCheckinCheckoutSnapshotsAndExportArePreserved() throws Exception {
        long id=employee("GEO2");service.enroll(id,face());service.saveSettings(geoRules());
        var result=service.recognize(face(),"in",position(31.2304,121.4737));
        assertEquals("学校实验楼",result.get("site"));assertEquals(0.0,result.get("site_distance"));
        var changed=geoRules();changed.put("site_name","新实验楼");service.saveSettings(changed);
        assertThrows(IllegalArgumentException.class,()->service.recognize(face(),"out",position(32,122)));
        assertNull(db.queryForObject("SELECT check_out FROM attendance",Object.class));
        service.recognize(face(),"out",position(31.2304,121.4737));
        var day=java.time.LocalDate.now(AttendanceService.ZONE);
        var row=service.records(day,day).get(0);
        assertEquals("学校实验楼",row.get("check_in_site"));assertEquals("新实验楼",row.get("check_out_site"));
        mvc.perform(get("/api/export").param("from",day.toString()).param("to",day.toString()).with(user("admin")))
            .andExpect(status().isOk()).andExpect(content().string(org.hamcrest.Matchers.containsString("学校实验楼")));
    }
    @Test void directApiCannotBypassLocationAndCheckingDoesNotWriteRecords() throws Exception {
        long id=employee("GEO3");service.enroll(id,face());service.saveSettings(geoRules());
        mvc.perform(post("/api/recognize").with(user("admin")).with(csrf()).contentType("application/json")
            .content(json.writeValueAsString(Map.of("descriptor",face(),"action","in")))).andExpect(status().isBadRequest());
        mvc.perform(post("/api/location/check").with(user("admin")).with(csrf()).contentType("application/json")
            .content(json.writeValueAsString(position(31.2304,121.4737)))).andExpect(status().isOk()).andExpect(jsonPath("$.distanceMeters").value(0.0));
        assertEquals(0,db.queryForObject("SELECT COUNT(*) FROM attendance",Integer.class));
        mvc.perform(post("/api/recognize").with(user("admin")).with(csrf()).contentType("application/json")
            .content(json.writeValueAsString(Map.of("descriptor",face(),"action","in","location",position(31.2304,121.4737)))))
            .andExpect(status().isOk()).andExpect(jsonPath("$.site").value("学校实验楼"));
    }
    @Test void disablingLocationAllowsCheckinWithoutCoordinates() throws Exception {
        service.saveSettings(geoRules());var config=geoRules();config.put("location_enabled",false);service.saveSettings(config);
        long id=employee("GEO4");service.enroll(id,face());
        assertEquals("签到成功",service.recognize(face(),"in").get("message"));
        assertNull(db.queryForObject("SELECT check_in_site FROM attendance",String.class));
        assertEquals("学校实验楼",service.settings().get("site_name"));
    }
    @Test void geographicDistanceHandlesKnownPointsAndDateLine() {
        assertEquals(0,LocationPolicy.distanceMeters(0,0,0,0),0.001);
        assertEquals(111195.08,LocationPolicy.distanceMeters(0,0,0,1),1);
        assertEquals(222.39,LocationPolicy.distanceMeters(0,179.999,0,-179.999),1);
    }
    @Test void legacySchemaUpgradePreservesSettingsEmployeesAndRecords() {
        var legacy=new JdbcTemplate(new org.springframework.jdbc.datasource.DriverManagerDataSource("jdbc:h2:mem:legacy;DB_CLOSE_DELAY=-1","sa",""));
        legacy.execute("CREATE TABLE settings(id INT PRIMARY KEY,start_time VARCHAR(5),end_time VARCHAR(5),threshold DOUBLE)");
        legacy.update("INSERT INTO settings VALUES(1,'08:30','17:30',0.45)");
        var migrated=new AttendanceService(legacy,json);migrated.init();
        migrated.addEmployee(Map.of("name","旧成员","code","OLD1","department","研发部","position","工程师"));
        long id=legacy.queryForObject("SELECT id FROM employees",Long.class);
        legacy.update("INSERT INTO attendance(employee_id,attendance_date,status,source) VALUES(?,CURRENT_DATE,'正常','演示数据')",id);
        migrated.init();
        assertEquals("08:30",migrated.settings().get("start_time"));
        assertEquals(false,migrated.settings().get("location_enabled"));
        assertEquals(1,legacy.queryForObject("SELECT COUNT(*) FROM attendance",Integer.class));
        assertEquals("旧成员",migrated.employees().get(0).get("name"));
    }
}
