const fs = require('fs');
const path = require('path');

async function setp1() {
    const src = path.join(__dirname, 'AndroidManifest.xml');
    const destDir = path.join(__dirname, '../../../android/app/src/main/');
    const dest = path.join(destDir, 'AndroidManifest.xml');
    
    // 确保目标目录存在
    await fs.promises.mkdir(destDir, { recursive: true });
    // 复制文件
    await fs.promises.copyFile(src, dest);
    console.log('✅ AndroidManifest.xml 复制成功');
}

async function setp2() {
    const src = path.join(__dirname, 'build.gradle');
    const dest = path.join(__dirname, '../../../android/app/build.gradle');
    
    // 确保目标目录存在
    const destDir = path.dirname(dest);
    await fs.promises.mkdir(destDir, { recursive: true });
    // 复制文件
    await fs.promises.copyFile(src, dest);
    console.log('✅ build.gradle 复制成功');
}
async function setp3() {
    const src = path.join(__dirname, 'MainApplication.kt');
    const dest = path.join(__dirname, '../../../android/app/src/main/java/com/ifG4jW/sa0vxY/F001/MainApplication.kt');
    
    // 确保目标目录存在
    const destDir = path.dirname(dest);
    await fs.promises.mkdir(destDir, { recursive: true });
    // 复制文件
    await fs.promises.copyFile(src, dest);
    console.log('✅ MainApplication.kt 复制成功');
}
async function setp4() {
    const filePath = path.resolve(__dirname,'../../../android/build.gradle');
    const INSERT_LINE = "maven { url 'https://developer.huawei.com/repo/' }";
    const INSERT_COMMENT = "// 华为 HMS Maven 仓库（MTPush 需要）";
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(INSERT_LINE)) {
        console.log('HMS Maven 仓库已存在，跳过');
        process.exit(0);
    }
    // 在 allprojects.repositories { 后插入
    content = content.replace(/allprojects\s*{\s*repositories\s*{\s*/m,
        match =>`${match}${INSERT_COMMENT}\n${INSERT_LINE}\n`);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('已成功插入 HMS Maven 仓库');
}
async function initMTPush() {
    console.log('🚀 MTPush 初始化中...');
    try {
        await setp1();
        await setp2();
        await setp3();
        await setp4();
        console.log('✅ MTPush 初始化完成');
    } catch (error) {
        console.error('❌ MTPush 初始化失败:', error);
        process.exit(1);
    }
}

initMTPush();