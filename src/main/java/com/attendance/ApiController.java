package com.attendance;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.dao.DataIntegrityViolationException;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ApiController {
    final AttendanceService service;
    public ApiController(AttendanceService service) { this.service=service; }
    @GetMapping("/csrf") Map<String,String> csrf(CsrfToken token) { return Map.of("token",token.getToken(),"headerName",token.getHeaderName()); }
    @GetMapping("/employees") Object employees() { return service.employees(); }
    @PostMapping("/employees") void add(@RequestBody Map<String,Object> data) { service.addEmployee(data); }
    @PatchMapping("/employees/{id}") void toggle(@PathVariable long id,@RequestBody Map<String,Boolean> data) { if(!data.containsKey("active")||data.get("active")==null) throw new IllegalArgumentException("缺少人员状态"); service.toggleEmployee(id,data.get("active")); }
    public record FaceInput(List<Double> descriptor,String action) {}
    @PostMapping("/employees/{id}/face") void enroll(@PathVariable long id,@RequestBody FaceInput input) throws Exception { service.enroll(id,input.descriptor()); }
    @PostMapping("/recognize") Object recognize(@RequestBody FaceInput input) { return service.recognize(input.descriptor(),input.action()); }
    @GetMapping("/settings") Object settings() { return service.settings(); }
    @PutMapping("/settings") void settings(@RequestBody Map<String,Object> data) { service.saveSettings(data); }
    @GetMapping("/records") Object records(@RequestParam LocalDate from,@RequestParam LocalDate to) { return service.records(from,to); }
    @PostMapping("/records/{id}/resolve") void resolve(@PathVariable long id,@RequestBody Map<String,String> input) { service.resolve(id,input.get("note")); }
    String csv(Object value) { String s=Objects.toString(value,""); if(s.matches("^[=+@\\-\\t\\r].*")) s="'"+s; return "\""+s.replace("\"","\"\"")+"\""; }
    @GetMapping(value="/export",produces="text/csv;charset=UTF-8") ResponseEntity<String> export(@RequestParam LocalDate from,@RequestParam LocalDate to) {
        var out=new StringBuilder("\uFEFF姓名,工号,部门,日期,签到,签退,状态,来源,处理说明\r\n");
        for(var r:service.records(from,to)) { out.append(String.join(",",List.of("name","code","department","day","check_in","check_out","status","source","note").stream().map(k->csv(r.get(k))).toList())).append("\r\n"); }
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=attendance-"+from+".csv").body(out.toString());
    }
    @ExceptionHandler({IllegalArgumentException.class,java.time.DateTimeException.class,DataIntegrityViolationException.class}) ResponseEntity<?> bad(Exception e) {
        return ResponseEntity.badRequest().body(Map.of("message",e instanceof DataIntegrityViolationException ? "工号已存在或数据不符合要求" : Objects.toString(e.getMessage(),"请求无效")));
    }
}
