import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 创建示例用户
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // 创建示例标签
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'JavaScript' },
      update: {},
      create: {
        name: 'JavaScript',
        slug: 'javascript',
        color: '#F7DF1E',
        description: 'JavaScript 编程语言相关内容',
      },
    }),
    prisma.tag.upsert({
      where: { name: 'React' },
      update: {},
      create: {
        name: 'React',
        slug: 'react',
        color: '#61DAFB',
        description: 'React 框架相关内容',
      },
    }),
    prisma.tag.upsert({
      where: { name: 'Node.js' },
      update: {},
      create: {
        name: 'Node.js',
        slug: 'nodejs',
        color: '#339933',
        description: 'Node.js 后端开发相关内容',
      },
    }),
  ]);

  // 创建示例文章
  const articles = [
    {
      slug: 'javascript-basics',
      title: 'JavaScript 基础教程',
      summary: '学习 JavaScript 的基础知识，包括变量、函数、对象等核心概念。',
      content: `# JavaScript 基础教程

## 变量声明

在 JavaScript 中，我们可以使用 \`var\`、\`let\` 和 \`const\` 来声明变量：

\`\`\`javascript
let name = 'John';
const age = 25;
var city = 'Beijing';
\`\`\`

## 函数

函数是 JavaScript 的核心概念之一：

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

const greetArrow = (name) => \`Hello, \${name}!\`;
\`\`\`

## 对象

JavaScript 中的对象是键值对的集合：

\`\`\`javascript
const person = {
  name: 'John',
  age: 25,
  greet() {
    return \`Hello, I'm \${this.name}\`;
  }
};
\`\`\`

这些是 JavaScript 的基础概念，掌握它们对于进一步学习很重要。`,
      category: 'programming',
      isPublished: true,
      isDraft: false,
      userId: user.id,
      readTime: 5,
    },
    {
      slug: 'react-hooks-guide',
      title: 'React Hooks 完全指南',
      summary: '深入了解 React Hooks，包括 useState、useEffect 等常用 Hook 的使用方法。',
      content: `# React Hooks 完全指南

## useState Hook

\`useState\` 是最常用的 Hook，用于在函数组件中添加状态：

\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## useEffect Hook

\`useEffect\` 用于处理副作用：

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

React Hooks 让函数组件拥有了类组件的能力，是现代 React 开发的核心。`,
      category: 'programming',
      isPublished: true,
      isDraft: false,
      userId: user.id,
      readTime: 8,
    },
    {
      slug: 'nodejs-express-tutorial',
      title: 'Node.js Express 框架入门',
      summary: '学习如何使用 Express 框架构建 Node.js Web 应用程序。',
      content: `# Node.js Express 框架入门

## 安装 Express

首先安装 Express：

\`\`\`bash
npm install express
\`\`\`

## 创建基本服务器

\`\`\`javascript
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});
\`\`\`

## 路由

Express 提供了强大的路由功能：

\`\`\`javascript
// GET 路由
app.get('/users', (req, res) => {
  res.json({ users: [] });
});

// POST 路由
app.post('/users', (req, res) => {
  // 创建用户逻辑
  res.status(201).json({ message: 'User created' });
});

// 带参数的路由
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ userId });
});
\`\`\`

Express 是 Node.js 生态系统中最流行的 Web 框架之一。`,
      category: 'backend',
      isPublished: true,
      isDraft: false,
      userId: user.id,
      readTime: 6,
    },
  ];

  for (const articleData of articles) {
    const article = await prisma.article.upsert({
      where: { slug: articleData.slug },
      update: {},
      create: articleData,
    });

    // 为文章添加标签
    if (articleData.category === 'programming') {
      await prisma.articleTag.upsert({
        where: {
          articleId_tagId: {
            articleId: article.id,
            tagId: tags[0].id, // JavaScript
          },
        },
        update: {},
        create: {
          articleId: article.id,
          tagId: tags[0].id,
        },
      });

      if (articleData.slug === 'react-hooks-guide') {
        await prisma.articleTag.upsert({
          where: {
            articleId_tagId: {
              articleId: article.id,
              tagId: tags[1].id, // React
            },
          },
          update: {},
          create: {
            articleId: article.id,
            tagId: tags[1].id,
          },
        });
      }
    }

    if (articleData.category === 'backend') {
      await prisma.articleTag.upsert({
        where: {
          articleId_tagId: {
            articleId: article.id,
            tagId: tags[2].id, // Node.js
          },
        },
        update: {},
        create: {
          articleId: article.id,
          tagId: tags[2].id,
        },
      });
    }
  }

  console.log('数据库种子数据创建完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });