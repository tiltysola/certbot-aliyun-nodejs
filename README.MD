# Certbot-Aliyun-Nodejs

> CertBot 阿里云自动更新DNS脚本

> 推荐使用 Node.JS 18 以上版本

## 使用方式

### 克隆仓库 & 安装依赖

```
git clone https://github.com/tiltysola/certbot-aliyun-nodejs
cd certbot-aliyun-nodejs
npm install // 亦可使用 cnpm/pnpm 管理依赖
```

### 配置环境

在当前目录下创建一个 `.env` 文件

```
ALIYUN_ACCESSKEY_ID={输入你的阿里云ID}
ALIYUN_ACCESSKEY_SECRET={输入你的阿里云SECRET}
```

### 创建脚本

在当前目录下创建一个 `apply_domain.sh` 以 `mahoutsukai.cn` 域名为例

```
certbot certonly -d "mahoutsukai.cn" -d "*.mahoutsukai.cn" --manual --preferred-challenges dns --manual-auth-hook "./index.js" --manual-cleanup-hook "./index.js --clean"
```

### 赋予执行权限 & 执行脚本

```
chmod +x ./apply_domain.sh
sudo ./apply_domain.sh
```
