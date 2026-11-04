# 知勤 · 人脸识别考勤管理系统

Java 17 + Spring Boot 3.5.7 + Spring Security + JDBC + H2。前端使用原生 HTML、CSS、JavaScript，由 Spring Boot 同源提供，无需 Node 构建步骤。使用 Git 版本控制。

## 本地启动（Windows PowerShell）

需要 JDK 17 和 Maven 3.6.3+，配置 `JAVA_HOME`，将 Maven 的 `bin` 加入 PATH。

```powershell
# 首次安装实际人脸识别模型（需要联网，约 14 MB）
powershell -ExecutionPolicy Bypass -File ./scripts/download-models.ps1

# 启动，可用 -Port 8081 指定端口
powershell -ExecutionPolicy Bypass -File ./scripts/start.ps1
```

浏览器访问 http://localhost:8080 。默认演示账号 `admin`，密码 `Admin@2026`。允许浏览器使用摄像头，推荐 Chrome 或 Edge。

标准 Maven 命令：

```powershell
mvn -Dmaven.repo.local=./tools/m2 test
mvn -Dmaven.repo.local=./tools/m2 package
java -jar target/attendance-management-1.0.0.jar
```

首次 Maven 构建需要下载依赖。`tools/m2` 为项目内依赖缓存，不进入 Git。

## 功能与操作流程

- **考勤总览**：今日应到、实际出勤、异常、尚未签到；近 7 / 30 天趋势、出勤分布、搜索与部门筛选。
- **人员管理**：新增人员，唯一工号，在职/停用管理，人脸录入与重复人脸检查。
- **人脸打卡**：本地摄像头 → TinyFaceDetector → 68 点定位 → 128 维人脸描述符 → 后端欧氏距离匹配 → 持久化签到/签退。识别不到、多张人脸、模糊匹配、无档案均拒绝打卡，不会生成假成功结果。
- **考勤记录**：日期查询、姓名/工号/部门/状态筛选、分页、异常核实备注。处理保留原始状态。
- **数据统计**：趋势、分布、本月部门出勤与正常打卡比例。CSV 导出带中文 BOM，并处理公式注入字符。
- **系统设置**：上/下班时间与识别阈值，后续打卡按新规则判断。
- **管理员认证**：Spring Security 会话登录，BCrypt 密码编码、CSRF 保护；API 未登录返回 401。

先到“人员管理”新增真实人员，再点击“录入人脸”，经本人知情同意后采集。然后到“人脸打卡”完成上班签到/下班签退。每人每天仅允许一次签到和一次签退，签退必须在签到后。

首次启动会生成 24 位虚构成员及最近一个月的考勤演示记录，来源列明确标记“演示数据”，不含人脸特征。示例数据仅在数据库为空且 `SEED_DEMO=true` 时生成。演示人员不应录入其他人的人脸；建议新增真实人员。

## 配置与数据

### 签到地点与范围限制

在 **系统设置 → 签到地点** 勾选“启用地点范围限制”，设置地点名称、纬度、经度、允许半径（10–10000 米，默认 200 米），点击“保存设置”。支持一个统一地点，上班签到和下班签退都适用。可手工输入 GPS/WGS84 坐标，或由本人点击“使用当前位置作为地点”并授权浏览器定位。其他地图坐标需先转换为 WGS84。

在“人脸打卡”页面可先点击“检查当前位置”，正式识别时会重新获取位置。服务端自行计算球面距离，并拒绝超范围、缺失、超过 2 分钟的定位，以及误差超过允许半径的定位；无法定位时不会生成考勤记录。关闭限制后无需定位，已保存的地点配置保留。签到和签退分别保存当时的地点名称及距中心距离，详情和 CSV 可查看，不保存打卡者的原始经纬度，也不持续跟踪位置。

旧数据库启动时自动添加字段，已有人员、考勤和时间规则保留；地点限制默认关闭，不影响现有签到流程。浏览器定位需要 localhost 或 HTTPS，桌面电脑或室内定位可能误差较大。当前使用客户端报告的位置，无法防止模拟定位，应结合真实设备和现场测试评估，不作为可信终端认证。

`POST /api/location/check` 可在管理员登录并携带 CSRF token 时检查已保存的地点规则；请求格式与 `/api/recognize` 的可选 `location` 字段一致：

```json
{"latitude":31.2304,"longitude":121.4737,"accuracy":20,"timestamp":1793779200000}
```

`accuracy` 单位为米，`timestamp` 必须替换为本次定位的真实 Unix 毫秒时间戳。检查接口不写入考勤；实际识别仍会独立校验范围。地点限制启用后，不带 `location` 的旧打卡请求将被拒绝。

| 环境变量 | 默认值 | 用途 |
| --- | --- | --- |
| `PORT` | `8080` | 服务端口 |
| `BIND_ADDRESS` | `127.0.0.1` | 默认仅监听本机 |
| `ADMIN_USERNAME` | `admin` | 管理员账号 |
| `ADMIN_PASSWORD` | `Admin@2026` | 管理员密码，实际使用前修改 |
| `DB_PASSWORD` | 空 | H2 数据库连接密码 |
| `SEED_DEMO` | `true` | 新数据库是否生成演示数据 |

```powershell
$env:ADMIN_PASSWORD = '替换为你的强密码'
$env:SEED_DEMO = 'false'
./scripts/start.ps1
```

数据库在 `data/attendance.mv.db`，应用重启保留数据；此目录不进入 Git。新实例设 `SEED_DEMO=false` 使用空数据库。已有演示库不会因修改此变量清空。备份前先关闭服务，复制完整 `data/` 目录。管理员账号配置不存入数据库。

系统按北京时间（Asia/Shanghai）和单日单班次计算，未接入排班、请假与节假日，因此“尚未签到”不等同于旷工。异常包含迟到、早退。统计中的历史部门按人员当前部门展示。CSV 按选定日期导出完整记录，不附带页面搜索筛选。

## 人脸识别组件与边界

模型与脚本通过 `scripts/download-models.ps1` 固定下载 `@vladmandic/face-api@1.7.15` 到静态资源目录，安装后运行时无需外网。模型和库一同打包，许可文件位于 `src/main/resources/static/vendor/FACE-API-LICENSE.txt`。原始视频帧与照片不上传、不持久化；上传的描述符属于敏感个人数据，请控制数据文件访问权限并取得采集授权。

当前采用浏览器侧特征提取与后端特征比对，**未集成活体检测或可信终端校验**，存在照片重放或伪造描述符风险，适用于课程项目和受监督演示；正式考勤设备需要服务端可信提取、活体检测及防重放。只支持管理员管理与打卡界面，未提供员工自助账号、角色分权和多终端考勤。远程访问摄像头需要 HTTPS，localhost 可直接使用。

## 项目结构

```text
src/main/java/com/attendance/   启动类、安全配置、REST API、考勤服务
src/main/resources/static/     登录页、管理界面、图表、人脸采集
src/main/resources/application.properties
src/test/java/com/attendance/  集成测试
scripts/                      启动与模型安装脚本
data/                         运行时数据库（忽略）
tools/m2/                     Maven 缓存（忽略）
```

## 接口

除 `/api/csrf` 外均要求管理员登录；修改请求需 CSRF token。

| 方法 | 路径 | 功能 |
| --- | --- | --- |
| GET / POST | `/api/employees` | 查询 / 新增人员 |
| PATCH | `/api/employees/{id}` | 启用 / 停用 |
| POST | `/api/employees/{id}/face` | 录入 128 维 descriptor |
| POST | `/api/recognize` | `{descriptor: [...], action: "in"或"out"}` |
| GET | `/api/records?from=YYYY-MM-DD&to=YYYY-MM-DD` | 日期范围记录（最多一年） |
| POST | `/api/records/{id}/resolve` | `{note: "核实说明"}` |
| GET / PUT | `/api/settings` | 获取 / 更新规则 |
| GET | `/api/export?from=YYYY-MM-DD&to=YYYY-MM-DD` | 导出 CSV |

## Git

已初始化 Git 仓库，源代码、测试、识别资源和文档进入版本控制，数据库、日志与构建缓存被忽略。不自动创建远程仓库。常用命令：`git status`、`git log --oneline`。
