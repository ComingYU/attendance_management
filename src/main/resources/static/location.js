'use strict';
const attendanceLocation = {
  escape(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },
  settingsMarkup(config) {
    const e = value => this.escape(value);
    return `<section class="location-settings"><h2>签到地点</h2>
      <p class="muted">设置一个统一的打卡地点，同时适用于上班签到和下班签退。</p>
      <label class="location-toggle"><input id="location-enabled" name="location_enabled" type="checkbox" ${config.location_enabled ? 'checked' : ''}>启用地点范围限制</label>
      <fieldset id="location-fields" ${config.location_enabled ? '' : 'disabled'}>
        <label>地点名称<input name="site_name" maxlength="100" required placeholder="例如：学校实验楼" value="${e(config.site_name)}"></label>
        <div class="form-row"><label>纬度<input name="site_latitude" type="number" min="-90" max="90" step="any" required placeholder="-90 至 90" value="${e(config.site_latitude)}"></label>
        <label>经度<input name="site_longitude" type="number" min="-180" max="180" step="any" required placeholder="-180 至 180" value="${e(config.site_longitude)}"></label></div>
        <label>允许打卡半径（米）<input name="site_radius" type="number" min="10" max="10000" step="1" value="${e(config.site_radius ?? 200)}" required><small>以该坐标为中心，推荐从 200 米开始，根据现场定位精度调整。</small></label>
        <button type="button" class="button" data-location-action="fill">使用当前位置作为地点</button>
        <div id="location-feedback" class="location-feedback" role="status"></div>
      </fieldset>
      <div class="notice">开启后，打卡需要允许浏览器定位。请使用 GPS / WGS84 坐标；其他地图坐标须先转换。关闭后无需定位，已保存的地点资料会保留。当前位置填入后，请点击下方“保存设置”。</div>
    </section>`;
  },
  guideMarkup(config) {
    if (!config.location_enabled) return '<div class="notice location-guide">地点限制未开启，可在“系统设置 → 签到地点”配置。</div>';
    return `<div class="notice location-guide"><strong>打卡地点：${this.escape(config.site_name)}</strong><br>允许半径 ${this.escape(config.site_radius)} 米 · 识别时自动获取定位<br><button class="text-link" data-location-action="check">检查当前位置</button><div id="checkin-location-feedback" class="location-feedback" role="status"></div></div>`;
  },
  recordMarkup(record) {
    return ['in','out'].map(action => {
      const site = record[`check_${action}_site`], distance = record[`check_${action}_site_distance`];
      return site ? `<br>${action === 'in' ? '签到' : '签退'}地点：${this.escape(site)}（距中心 ${this.escape(distance)} 米）` : '';
    }).join('');
  },
  position() {
    return new Promise((resolve, reject) => {
      if (!window.isSecureContext || !navigator.geolocation) return reject(Error('定位需要在 localhost 或 HTTPS 网站中使用，请检查浏览器支持情况'));
      navigator.geolocation.getCurrentPosition(position => resolve({latitude:position.coords.latitude, longitude:position.coords.longitude, accuracy:position.coords.accuracy, timestamp:position.timestamp}), error => reject(Error({1:'定位权限被拒绝，请在浏览器网站权限中允许位置访问后重试',2:'暂时无法获取位置，请检查设备定位服务或移至开阔处',3:'定位超时，请检查网络和设备定位服务后重试'}[error.code] || '获取位置失败，请重试')), {enableHighAccuracy:true,timeout:15000,maximumAge:0});
    });
  },
  prepareSettings(input, form) {
    input.location_enabled = form.elements.location_enabled.checked;
    if (!input.location_enabled) return;
    input.site_name = form.elements.site_name.value.trim();
    for (const key of ['site_latitude','site_longitude','site_radius']) {
      const value = form.elements[key].value;
      input[key] = value === '' ? null : Number(value);
    }
  },
  async forCheckin() {
    const config = await api('/settings');
    if (!config.location_enabled) return null;
    const status = document.querySelector('#camera-status');
    if (status) status.textContent = '正在获取打卡位置，请允许浏览器定位…';
    return this.position();
  }
};
document.addEventListener('change', event => {
  if (event.target.id === 'location-enabled') document.querySelector('#location-fields').disabled = !event.target.checked;
});
document.addEventListener('click', async event => {
  const button = event.target.closest('[data-location-action]');
  if (!button) return;
  const fill = button.dataset.locationAction === 'fill';
  const feedback = document.querySelector(fill ? '#location-feedback' : '#checkin-location-feedback');
  button.disabled = true;
  if (feedback) { feedback.textContent = '正在获取位置，请允许浏览器定位…'; feedback.classList.remove('error-text'); }
  try {
    const position = await attendanceLocation.position();
    if (!button.isConnected) return;
    if (fill) {
      const form = document.querySelector('#settings-form');
      form.elements.site_latitude.value = position.latitude.toFixed(6);
      form.elements.site_longitude.value = position.longitude.toFixed(6);
      feedback.textContent = `已填入当前位置，定位误差约 ${Math.round(position.accuracy)} 米。请核对并保存设置。`;
    } else {
      const result = await api('/location/check', {method:'POST',body:JSON.stringify(position)});
      feedback.textContent = result.site ? `在允许范围内，距 ${result.site} 中心 ${result.distanceMeters} 米，定位误差约 ${Math.round(position.accuracy)} 米。正式打卡时会重新定位。` : '地点限制已关闭，无需位置校验。';
    }
  } catch (error) {
    if (feedback?.isConnected) { feedback.textContent = error.message; feedback.classList.add('error-text'); }
  } finally { if (button.isConnected) button.disabled = false; }
});
