fetch('/api/csrf').then(r=>{if(!r.ok)throw Error();return r.json()}).then(x=>{document.querySelector('#csrf').value=x.token;document.querySelector('#login-submit').disabled=false}).catch(()=>document.querySelector('#login-error').textContent='连接失败，请刷新页面重试');
if(new URLSearchParams(location.search).has('error'))document.querySelector('#login-error').textContent='账号或密码不正确，请重试。';
