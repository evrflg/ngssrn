#!/usr/bin/env node
/**
 * 图片无损压缩脚本
 * 用法:
 *   npm run compress-images              # 压缩整个 images 目录
 *   npm run compress-images vip          # 仅压缩 images/vip 目录
 */

// 检查 Node.js 版本（sharp 0.32.6 支持 Node.js 14+）
const nodeVersion = process.version
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
if (majorVersion < 14) {
  console.error('\n❌ 错误: Node.js 版本过低！')
  console.error(`   当前版本: ${nodeVersion}`)
  console.error(`   需要版本: >= 14.0.0`)
  console.error('\n解决方案:')
  console.error('   升级 Node.js: nvm install 14 或更高版本\n')
  process.exit(1)
}

import { readdir, stat } from 'fs/promises'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { renameSync, unlinkSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 检测是否支持颜色（Windows CMD 可能不支持）
const supportsColor = process.platform !== 'win32' || process.env.TERM || process.env.WT_SESSION

// ANSI 颜色代码
const colors = supportsColor ? {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
} : {
  green: '',
  red: '',
  yellow: '',
  gray: '',
  cyan: '',
  reset: '',
}

// 获取命令行参数
const subDir = process.argv[2] || ''
const imagesRoot = join(__dirname, './src/assets/images')
const targetDir = subDir ? join(imagesRoot, subDir) : imagesRoot

let totalOriginalSize = 0
let totalNewSize = 0
let compressedCount = 0
let skippedCount = 0
let errorCount = 0

async function compressImage(filePath, sharp) {
  const ext = filePath.toLowerCase().split('.').pop()
  const relativePath = relative(imagesRoot, filePath)

  try {
    const image = sharp(filePath)
    const metadata = await image.metadata()
    const originalSize = (await stat(filePath)).size

    totalOriginalSize += originalSize

    let compressed
    if (ext === 'png') {
      // PNG 无损压缩
      compressed = image.png({
        compressionLevel: 9,
        quality: 100
      })
    } else if (ext === 'webp') {
      // WebP 无损压缩
      compressed = image.webp({
        lossless: true,
        quality: 100
      })
    } else if (ext === 'jpg' || ext === 'jpeg') {
      // JPEG 近无损压缩 (质量100)
      compressed = image.jpeg({
        quality: 100,
        mozjpeg: true
      })
    } else {
      return
    }

    const tmpPath = filePath + '.tmp'
    await compressed.toFile(tmpPath)

    const newSize = (await stat(tmpPath)).size
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(2)

    // 只有文件变小才替换
    if (newSize < originalSize) {
      renameSync(tmpPath, filePath)
      totalNewSize += newSize
      compressedCount++
      console.log(`${colors.green}✅ ${relativePath}: ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (省${savings}%)${colors.reset}`)
    } else {
      unlinkSync(tmpPath)
      totalNewSize += originalSize
      skippedCount++
      console.log(`${colors.gray}⏭️  ${relativePath}: 已是最优 (${(originalSize / 1024).toFixed(1)}KB)${colors.reset}`)
    }
  } catch (error) {
    totalNewSize += (await stat(filePath)).size
    errorCount++
    console.error(`${colors.red}❌ ${relativePath}: ${error.message}${colors.reset}`)
  }
}

async function processDirectory(dirPath, sharp) {
  const files = await readdir(dirPath)

  for (const file of files) {
    const filePath = join(dirPath, file)
    const fileStat = await stat(filePath)

    if (fileStat.isDirectory()) {
      // 递归处理子目录
      await processDirectory(filePath, sharp)
    } else if (fileStat.isFile() && /\.(png|jpe?g|webp)$/i.test(file)) {
      await compressImage(filePath, sharp)
    }
  }
}

async function main() {
  // 动态导入 sharp（在版本检查之后）
  let sharp
  try {
    const sharpModule = await import('sharp')
    sharp = sharpModule.default
  } catch (error) {
    console.error('\n❌ 无法加载 sharp 模块！')
    console.error(`   错误: ${error.message}`)
    console.error('\n解决方案:')
    console.error('   1. 检查 Node.js 版本是否 >= 18.17.0')
    console.error('   2. 重新安装依赖: npm install\n')
    process.exit(1)
  }

  console.log(`\n${colors.cyan}🖼️  图片无损压缩工具${colors.reset}\n`)
  console.log(`📁 目标目录: ${colors.yellow}${relative(process.cwd(), targetDir)}${colors.reset}\n`)

  const startTime = Date.now()

  try {
    await processDirectory(targetDir, sharp)

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    const totalSavings = totalOriginalSize - totalNewSize
    const savingsPercent = totalOriginalSize > 0
      ? ((totalSavings / totalOriginalSize) * 100).toFixed(2)
      : 0

    console.log('\n' + '='.repeat(60))
    console.log('📊 压缩统计:')
    console.log('='.repeat(60))
    console.log(`${colors.green}✅ 成功压缩: ${compressedCount} 个文件${colors.reset}`)
    console.log(`${colors.gray}⏭️  已是最优: ${skippedCount} 个文件${colors.reset}`)
    if (errorCount > 0) {
      console.log(`${colors.red}❌ 压缩失败: ${errorCount} 个文件${colors.reset}`)
    }
    console.log(`📦 原始大小: ${(totalOriginalSize / 1024).toFixed(2)} KB`)
    console.log(`📦 压缩后:   ${(totalNewSize / 1024).toFixed(2)} KB`)
    if (totalSavings > 0) {
      console.log(`${colors.cyan}💾 节省空间: ${(totalSavings / 1024).toFixed(2)} KB (${savingsPercent}%)${colors.reset}`)
    } else {
      console.log(`💾 节省空间: 0 KB (0%)`)
    }
    console.log(`⏱️  耗时:     ${duration} 秒`)
    console.log('='.repeat(60))
    console.log('\n✨ 全部完成！\n')
  } catch (error) {
    console.error('\n❌ 处理失败:', error.message)
    process.exit(1)
  }
}

main()

