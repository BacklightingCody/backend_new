const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api';

async function testInterceptor() {
  console.log('🧪 测试请求日志拦截器...\n');

  try {
    // 测试1: GET请求（带查询参数）
    console.log('📝 测试1: GET请求（带查询参数）');
    const getResponse = await axios.get(`${BASE_URL}/articles?page=1&limit=10`);
    console.log(`✅ GET请求成功: ${getResponse.status}\n`);

    // 测试2: POST请求（带请求体）
    console.log('📝 测试2: POST请求（带请求体）');
    const postData = {
      title: '测试文章',
      content: '这是一个测试文章的内容',
      category: '测试',
      tags: ['测试', '拦截器']
    };
    const postResponse = await axios.post(`${BASE_URL}/articles`, postData);
    console.log(`✅ POST请求成功: ${postResponse.status}\n`);

    // 测试3: 认证请求
    console.log('📝 测试3: 认证请求');
    const authData = {
      email: 'test@example.com',
      password: 'testpassword'
    };
    const authResponse = await axios.post(`${BASE_URL}/auth/login`, authData);
    console.log(`✅ 认证请求成功: ${authResponse.status}\n`);

    // 测试4: 带路径参数的请求
    console.log('📝 测试4: 带路径参数的请求');
    const paramResponse = await axios.get(`${BASE_URL}/articles/categories`);
    console.log(`✅ 路径参数请求成功: ${paramResponse.status}\n`);

    console.log('🎉 所有测试完成！请查看控制台日志以验证拦截器是否正常工作。');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testInterceptor();
