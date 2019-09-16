import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '*',
      redirect: '/admin'
    },
    {
      path: '/login',
      name: 'Login Page',
      component: () => import('./views/Login.vue')
    },
    {
      path: '/user',
      name: 'User Dashboard',
      component: () => import('./views/UserDashboard.vue')
    },
    {
      path: '/file-manager',
      component: () => import('./views/filemanager.vue')
    },
    {
      path: '/admin',
      name: 'Admin Dashboard',
      component: () => import('./views/AdminDashboard.vue'),
      redirect: '/ad-main',
      children: [
        {
          path: '/ad-main',
          name: 'Admin Dashboard Main Page',
          component: () => import('./views/AdmMainPage.vue'),
          meta: { title: '系统首页' }
        },
        {
          path: '/ad-stats',
          name: 'Admin Dashboard Statistic',
          component: () => import('./views/AdmStatsPage.vue'),
          meta: { title: '数据统计' }
        },
        {
          path: '/ad-user',
          name: 'Admin Dashboard User Manager',
          component: () => import('./views/AdmUserPage.vue'),
          meta: { title: '用户管理' }
        },
        {
          path: '/ad-rank',
          name: 'Admin Dashboard User Rank',
          component: () => import('./views/AdmRankPage.vue'),
          meta: { title: '排名管理' }
        },
        {
          path: '/ad-files',
          name: 'Admin Dashboard File Manager',
          component: () => import('./views/AdmFilesPage.vue'),
          meta: { title: '文件管理' }
        }
      ]
    },
  ]
})

// 钩子函数进行权限跳转
router.beforeEach( (to, from, next) => {
  const role = sessionStorage.getItem('permission');
  if (!role && to.path !== '/login') {
    next('/login');
  } else {
    next();
  }
})

export default router;
