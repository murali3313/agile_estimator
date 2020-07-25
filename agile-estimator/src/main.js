// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import TextareaAutosize from 'vue-textarea-autosize'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default-dark.css'

Vue.config.productionTip = false
Vue.use(TextareaAutosize)
Vue.use(VueMaterial)
Vue.config.silent = true

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: {App},
  template: '<App/>'
})
window.util = {
  isEmpty: function (value) {
    return value === undefined || value === null || value === ''
  },
  isNotEmpty: function (value) {
    return value !== undefined && value !== null && value !== ''
  }
}
window.SessionStorageUtil = {
  sessionDetails: function (facilitatorId, facilitatorName, companyName,
    sessionUUID) {
    this.facilitatorName = facilitatorName
    this.facilitatorId = facilitatorId
    this.companyName = companyName
    this.sessionUUID = sessionUUID
  },
  personalDetails: function (userId, userName, roleId) {
    this.userId = userId
    this.roleId = roleId
    this.userName = userName
  },
  savePersonalDetails: function (sessionDetails, personalDetails) {
    localStorage.setItem('FacilitatorName', sessionDetails.facilitatorId)
    localStorage.setItem('FacilitatorId', sessionDetails.facilitatorName)
    localStorage.setItem('UserId', personalDetails.userId)
    localStorage.setItem('UserName', personalDetails.userName)
    localStorage.setItem('RoleId', personalDetails.roleId)
    localStorage.setItem('CompanyName', sessionDetails.companyName)
    localStorage.setItem('SessionId', sessionDetails.sessionUUID)
  },
  saveSessionId: function (sessionId) {
    localStorage.setItem('SessionId', sessionId)
  },

  isNewUser () {
    let userId = localStorage.getItem('UserId')
    return userId === null || userId === undefined || userId === ''
  },
  getSessionId () {
    return localStorage.getItem('SessionId')
  },
  getUserName () {
    return localStorage.getItem('UserName')
  },
  getUserId () {
    return localStorage.getItem('UserId')
  }
}
