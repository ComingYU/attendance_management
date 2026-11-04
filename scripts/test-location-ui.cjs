const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('src/main/resources/static/location.js', 'utf8');
const context = { document:{addEventListener(){}},window:{isSecureContext:true},navigator:{},api:async()=>({location_enabled:false}) };
vm.createContext(context);
vm.runInContext(source + '\nglobalThis.subject = attendanceLocation;', context);
const geo = context.subject;
(async()=>{
  assert.match(geo.settingsMarkup({location_enabled:false}), /fieldset id="location-fields" disabled/);
  assert.doesNotMatch(geo.settingsMarkup({location_enabled:true}), /fieldset id="location-fields" disabled/);
  assert.ok(geo.guideMarkup({location_enabled:true,site_name:'<script>',site_radius:200}).includes('&lt;script&gt;'));
  assert.ok(geo.recordMarkup({check_in_site:'A&B',check_in_site_distance:15}).includes('A&amp;B'));
  context.navigator.geolocation={getCurrentPosition(resolve,reject,options){
    assert.equal(options.maximumAge,0);assert.equal(options.enableHighAccuracy,true);
    resolve({coords:{latitude:0,longitude:0,accuracy:5},timestamp:100});
  }};
  const position=await geo.position();assert.equal(position.latitude,0);assert.equal(position.accuracy,5);
  context.navigator.geolocation={getCurrentPosition(resolve,reject){reject({code:1});}};
  await assert.rejects(()=>geo.position(),/定位权限被拒绝/);
  context.navigator.geolocation={getCurrentPosition(resolve,reject){reject({code:3});}};
  await assert.rejects(()=>geo.position(),/定位超时/);
  context.window.isSecureContext=false;
  await assert.rejects(()=>geo.position(),/HTTPS/);
  const disabled={};geo.prepareSettings(disabled,{elements:{location_enabled:{checked:false}}});
  assert.equal(disabled.location_enabled,false);assert.equal(Object.keys(disabled).length,1);
  assert.equal(await geo.forCheckin(),null);
  console.log('Location UI checks passed: markup, escaping, fresh position, permission/timeout errors, secure context, disabled settings and no-location mode.');
})().catch(error=>{console.error(error);process.exitCode=1;});
