// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import TextareaAutosize from 'vue-textarea-autosize'

Vue.config.productionTip = false
Vue.use(TextareaAutosize)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: {App},
  template: '<App/>'
})

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
    sessionStorage.setItem('FacilitatorName', sessionDetails.facilitatorId)
    sessionStorage.setItem('FacilitatorId', sessionDetails.facilitatorName)
    sessionStorage.setItem('UserId', personalDetails.userId)
    sessionStorage.setItem('UserName', personalDetails.userName)
    sessionStorage.setItem('RoleId', personalDetails.roleId)
    sessionStorage.setItem('CompanyName', sessionDetails.companyName)
    sessionStorage.setItem('SessionId', sessionDetails.sessionUUID)
  },
  saveSessionId: function (sessionId) {
    sessionStorage.setItem('SessionId', sessionId)
  },

  isNewUser () {
    let userId = sessionStorage.getItem('UserId')
    return userId === null || userId === undefined || userId === ''
  },
  getSessionId () {
    return sessionStorage.getItem('SessionId')
  },
  getUserName () {
    return sessionStorage.getItem('UserName')
  },
  getUserId () {
    return sessionStorage.getItem('UserId')
  }
}
