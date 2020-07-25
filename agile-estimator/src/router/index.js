import Vue from 'vue'
import Router from 'vue-router'
import AgileEstimatorHome from '@/components/AgileEstimatorHome'
import EstimationPanel from '@/components/EstimationPanel'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Agile Estimation Home',
      component: AgileEstimatorHome
    },
    { path: '/estimation/:id', component: EstimationPanel },
    { path: '*', component: AgileEstimatorHome }
  ]
})
