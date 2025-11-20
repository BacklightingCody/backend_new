const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api';

async function testEndpoints() {
  console.log('🧪 测试后端API端点...\n');

  try {
    // 测试1: 获取分类
    console.log('📝 测试1: GET /docs/categories');
    try {
      const categoriesResponse = await axios.get(`${BASE_URL}/docs/categories`);
      console.log(`✅ 分类API成功: ${categoriesResponse.status}`);
      console.log('响应数据:', JSON.stringify(categoriesResponse.data, null, 2));
    } catch (error) {
      console.log(`❌ 分类API失败: ${error.response?.status} - ${error.response?.statusText}`);
      console.log('错误详情:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 测试2: 获取所有文档
    console.log('📝 测试2: GET /docs/all');
    try {
      const docsResponse = await axios.get(`${BASE_URL}/docs/all`);
      console.log(`✅ 文档API成功: ${docsResponse.status}`);
      console.log('响应数据:', JSON.stringify(docsResponse.data, null, 2));
    } catch (error) {
      console.log(`❌ 文档API失败: ${error.response?.status} - ${error.response?.statusText}`);
      console.log('错误详情:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 测试3: 获取文章分类（articles路径）
    console.log('📝 测试3: GET /articles/categories');
    try {
      const articlesCategoriesResponse = await axios.get(`${BASE_URL}/articles/categories`);
      console.log(`✅ 文章分类API成功: ${articlesCategoriesResponse.status}`);
      console.log('响应数据:', JSON.stringify(articlesCategoriesResponse.data, null, 2));
    } catch (error) {
      console.log(`❌ 文章分类API失败: ${error.response?.status} - ${error.response?.statusText}`);
      console.log('错误详情:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 测试4: 获取所有文章
    console.log('📝 测试4: GET /articles');
    try {
      const articlesResponse = await axios.get(`${BASE_URL}/articles`);
      console.log(`✅ 文章API成功: ${articlesResponse.status}`);
      console.log('响应数据:', JSON.stringify(articlesResponse.data, null, 2));
    } catch (error) {
      console.log(`❌ 文章API失败: ${error.response?.status} - ${error.response?.statusText}`);
      console.log('错误详情:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testEndpoints();
