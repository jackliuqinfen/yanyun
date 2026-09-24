import { randomBytes, scryptSync } from 'node:crypto';

if (!process.stdin.isTTY) {
  console.error('请在交互式终端运行此脚本。');
  process.exit(1);
}
process.stdout.write('请输入新的管理员密码（输入内容不会显示）：');
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');
const password = await new Promise(resolve => {
  let value = '';
  process.stdin.on('data', chunk => {
    if (chunk === '\r' || chunk === '\n') {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write('\n');
      resolve(value);
    } else if (chunk === '\u0003') {
      process.stdin.setRawMode(false);
      process.stdout.write('\n');
      process.exit(130);
    } else if (chunk === '\u007f') {
      value = value.slice(0, -1);
    } else {
      value += chunk;
    }
  });
});
if (password.length < 16) {
  console.error('密码至少需要 16 个字符。');
  process.exitCode = 1;
} else {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt}:${hash}`);
}
