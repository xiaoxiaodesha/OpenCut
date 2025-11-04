#!/usr/bin/env node

/**
 * 检查 OpenCut 项目所需软件是否已安装
 * 支持 Windows、macOS 和 Linux
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// 软件检查配置
const softwareList = [
  {
    name: 'Node.js',
    command: 'node --version',
    minVersion: 18,
    required: true,
  },
  {
    name: 'npm',
    command: 'npm --version',
    required: false,
  },
  {
    name: 'Bun',
    command: 'bun --version',
    required: true,
  },
  {
    name: 'Docker',
    command: 'docker --version',
    required: false, // Docker 是可选的
  },
  {
    name: 'Docker Compose',
    command: 'docker compose version',
    required: false, // Docker Compose 是可选的
  },
  {
    name: 'PostgreSQL',
    command: process.platform === 'win32' 
      ? 'psql --version' 
      : 'psql --version',
    minVersion: 12,
    required: false, // 如果 Docker 未安装，则必需
    checkIfDockerMissing: true, // 如果 Docker 未安装，则检查此软件
  },
  {
    name: 'Redis',
    command: process.platform === 'win32'
      ? 'wsl redis-cli --version'
      : 'redis-cli --version',
    minVersion: 6,
    required: false, // 如果 Docker 未安装，则必需
    checkIfDockerMissing: true, // 如果 Docker 未安装，则检查此软件
    alternativeCommands: process.platform === 'win32' 
      ? ['redis-cli --version'] // 如果 WSL 命令失败，尝试本地 redis-cli（Memurai）
      : [],
  },
  {
    name: 'Git',
    command: 'git --version',
    required: true,
  },
];

// 颜色输出（Windows 10+ 支持 ANSI 颜色）
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  // 检查是否在 Windows 上且是否支持 ANSI（Windows 10+）
  if (process.platform === 'win32') {
    // 尝试启用 ANSI 颜色支持
    try {
      require('child_process').execSync('chcp 65001 >nul 2>&1', { stdio: 'ignore' });
    } catch {
      // 忽略错误
    }
  }
  return `${colors[color]}${text}${colors.reset}`;
}

// 解析版本号
function parseVersion(versionString) {
  if (!versionString) return null;
  
  // 提取版本号（例如 "v18.17.0" -> "18.17.0"）
  const match = versionString.match(/(\d+)\.(\d+)\.(\d+)/);
  if (match) {
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      full: match[0],
    };
  }
  
  // 如果只有主版本号（例如 "18"）
  const majorMatch = versionString.match(/(\d+)/);
  if (majorMatch) {
    return {
      major: parseInt(majorMatch[1], 10),
      minor: 0,
      patch: 0,
      full: majorMatch[1],
    };
  }
  
  return null;
}

// 检查软件
async function checkSoftware(software) {
  // 尝试主命令
  try {
    const { stdout, stderr } = await execAsync(software.command, {
      timeout: 5000,
      encoding: 'utf8',
    });
    
    if (stderr && !stdout) {
      throw new Error(stderr.trim());
    }
    
    const versionString = stdout.trim();
    const version = parseVersion(versionString);
    
    // 检查最低版本要求
    let versionOk = true;
    if (software.minVersion && version) {
      versionOk = version.major >= software.minVersion;
    }
    
    return {
      installed: true,
      version: version ? version.full : versionString,
      rawVersion: versionString,
      versionOk,
      error: null,
    };
  } catch (error) {
    // 如果有备用命令，尝试备用命令
    if (software.alternativeCommands && software.alternativeCommands.length > 0) {
      for (const altCommand of software.alternativeCommands) {
        try {
          const { stdout, stderr } = await execAsync(altCommand, {
            timeout: 5000,
            encoding: 'utf8',
          });
          
          if (stderr && !stdout) {
            continue; // 尝试下一个备用命令
          }
          
          const versionString = stdout.trim();
          const version = parseVersion(versionString);
          
          // 检查最低版本要求
          let versionOk = true;
          if (software.minVersion && version) {
            versionOk = version.major >= software.minVersion;
          }
          
          return {
            installed: true,
            version: version ? version.full : versionString,
            rawVersion: versionString,
            versionOk,
            error: null,
          };
        } catch {
          continue; // 尝试下一个备用命令
        }
      }
    }
    
    return {
      installed: false,
      version: null,
      error: error.message,
    };
  }
}

// 主函数
async function main() {
  console.log(colorize('\n=== OpenCut 项目依赖检查 ===\n', 'cyan'));
  console.log('正在检查所需软件...\n');
  
  const results = [];
  let allPassed = true;
  
  // 首先检查 Docker 是否安装
  let dockerInstalled = false;
  let dockerComposeInstalled = false;
  
  for (const software of softwareList) {
    if (software.name === 'Docker' || software.name === 'Docker Compose') {
      process.stdout.write(`检查 ${software.name}... `);
      const result = await checkSoftware(software);
      results.push({ ...software, ...result, required: software.required });
      
      if (software.name === 'Docker' && result.installed) {
        dockerInstalled = true;
      }
      if (software.name === 'Docker Compose' && result.installed) {
        dockerComposeInstalled = true;
      }
      
      if (result.installed) {
        console.log(
          colorize(`✓ 已安装 (版本: ${result.version})`, 'green')
        );
      } else {
        console.log(colorize('✗ 未安装 (可选)', 'yellow'));
      }
    }
  }
  
  // 如果 Docker 未安装，则 PostgreSQL 和 Redis 变为必需
  const dockerAvailable = dockerInstalled && dockerComposeInstalled;
  
  if (!dockerAvailable) {
    console.log(
      colorize(
        '\n注意：未检测到 Docker。将检查本地安装的 PostgreSQL 和 Redis。\n',
        'yellow'
      )
    );
  }
  
  // 检查其他软件
  for (const software of softwareList) {
    if (software.name === 'Docker' || software.name === 'Docker Compose') {
      continue; // 已经检查过了
    }
    
    // 如果软件设置了 checkIfDockerMissing，且 Docker 已安装，则跳过
    if (software.checkIfDockerMissing && dockerAvailable) {
      continue;
    }
    
    // 如果软件设置了 checkIfDockerMissing，且 Docker 未安装，则变为必需
    const isRequired = software.required || 
      (software.checkIfDockerMissing && !dockerAvailable);
    
    process.stdout.write(`检查 ${software.name}... `);
    const result = await checkSoftware(software);
    results.push({ ...software, ...result, required: isRequired });
    
    if (result.installed) {
      if (software.minVersion && !result.versionOk) {
        console.log(
          colorize(
            `✗ 已安装 (版本: ${result.version}) - 需要 v${software.minVersion}+`,
            'red'
          )
        );
        if (isRequired) {
          allPassed = false;
        }
      } else {
        console.log(
          colorize(`✓ 已安装 (版本: ${result.version})`, 'green')
        );
      }
    } else {
      const status = isRequired
        ? colorize('✗ 未安装 (必需)', 'red')
        : colorize('✗ 未安装 (可选)', 'yellow');
      console.log(status);
      if (isRequired) {
        allPassed = false;
      }
    }
  }
  
  // 详细报告
  console.log(colorize('\n=== 详细报告 ===\n', 'cyan'));
  
  for (const result of results) {
    // 如果软件设置了 checkIfDockerMissing 且 Docker 可用，则跳过显示
    if (result.checkIfDockerMissing && dockerAvailable) {
      continue;
    }
    
    console.log(`${colorize(result.name, 'blue')}:`);
    if (result.installed) {
      console.log(`  状态: ${colorize('已安装', 'green')}`);
      console.log(`  版本: ${result.rawVersion}`);
      if (result.minVersion && !result.versionOk) {
        console.log(
          `  ${colorize('警告', 'yellow')}: 当前版本 ${result.version} 低于要求版本 v${result.minVersion}+`
        );
      }
    } else {
      console.log(`  状态: ${colorize('未安装', 'red')}`);
      if (result.required) {
        console.log(`  ${colorize('必需', 'red')}: 必须安装此软件才能运行项目`);
      } else {
        console.log(`  ${colorize('可选', 'yellow')}: 此软件为可选安装`);
      }
      if (result.error) {
        console.log(`  错误: ${result.error}`);
      }
    }
    console.log('');
  }
  
  // 如果使用 Docker，显示提示信息
  if (dockerAvailable) {
    console.log(
      colorize(
        '提示：检测到 Docker 已安装。PostgreSQL 和 Redis 将通过 Docker 运行，无需本地安装。\n',
        'cyan'
      )
    );
  }
  
  // 总结
  console.log(colorize('=== 检查结果 ===\n', 'cyan'));

  if (allPassed) {
    console.log(colorize('✓ 所有必需软件已正确安装！', 'green'));
    console.log(colorize('你可以继续进行项目部署。\n', 'green'));
    
    if (!dockerAvailable) {
      console.log(
        colorize(
          '提示：你选择不使用 Docker。请确保 PostgreSQL 和 Redis 服务已启动。\n',
          'cyan'
        )
      );
    }
    
    process.exit(0);
  } else {
    console.log(colorize('✗ 部分必需软件未安装或版本不符合要求。', 'red'));
    console.log('\n请参考 hd_README.md 文档进行安装：\n');
    
    const missing = results.filter((r) => r.required && !r.installed);
    const outdated = results.filter(
      (r) => r.required && r.installed && r.minVersion && !r.versionOk
    );
    
    if (missing.length > 0) {
      console.log(colorize('未安装的必需软件：', 'yellow'));
      for (const item of missing) {
        console.log(`  - ${item.name}`);
      }
      console.log('');
    }
    
    if (outdated.length > 0) {
      console.log(colorize('版本不符合要求的软件：', 'yellow'));
      for (const item of outdated) {
        console.log(`  - ${item.name} (当前: ${item.version}, 需要: v${item.minVersion}+)`);
      }
      console.log('');
    }
    
    if (!dockerAvailable && missing.some((r) => r.name === 'PostgreSQL' || r.name === 'Redis')) {
      console.log(
        colorize(
          '提示：你可以选择安装 Docker 来简化部署，或者手动安装 PostgreSQL 和 Redis。\n',
          'cyan'
        )
      );
    }
    
    process.exit(1);
  }
}

// 运行检查
main().catch((error) => {
  console.error(colorize('检查过程中发生错误:', 'red'));
  console.error(error);
  process.exit(1);
});

