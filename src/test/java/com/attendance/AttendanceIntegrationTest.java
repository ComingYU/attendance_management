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
        db.update("UPDATE settings SET start_time='09:00',end_time='18:00',threshold=0.50 WHERE id=1");
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
}
