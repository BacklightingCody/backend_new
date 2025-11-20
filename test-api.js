/**
 * API测试脚本
 * 用于验证后端API是否正常工作
 * 
 * 使用方法：
 * node test-api.js
 */

const http = require('http');

// 测试健康检查端点
function testHealthEndpoint() {
  console.log('测试健康检查端点...');
  
  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/health',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const req = http.request(options, (res) => {
    console.log(`状态码: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('响应数据:', data);
      console.log('健康检查测试完成\n');
      
      // 测试文档端点
      testDocsEndpoint();
    });
  });

  req.on('error', (error) => {
    console.error('请求错误:', error);
  });

  req.end();
}

// 测试文档端点
function testDocsEndpoint() {
  console.log('测试文档端点...');
  
  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/docs/all',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const req = http.request(options, (res) => {
    console.log(`状态码: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('响应数据:', data);
      console.log('文档端点测试完成');
    });
  });

  req.on('error', (error) => {
    console.error('请求错误:', error);
  });

  req.end();
}

// 开始测试
console.log('开始API测试...\n');
testHealthEndpoint();