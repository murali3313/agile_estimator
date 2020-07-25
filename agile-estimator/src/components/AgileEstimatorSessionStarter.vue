<template>
  <div v-if="display">
    <transition name="modal">
      <div class="modal-content">
        <div class="modal-header ">
          <h4>Tell us some basic info to start your estimation!!</h4>
          <span class="close rowColor" @click="$emit('close')">&times;</span>
        </div>
        <div class="modal-body container-fluid">
          <div class="row">
            <h5 class="col-md-6 first-column">Your company name</h5>
            <div class="col-md-6">
              <input type="text" v-model="companyName" style="width:100%" />
              <p class="text-danger" v-if="companyNameMandatory">Please provide your company or product name</p>
            </div>
          </div>
          <div class="row">
            <h5 class="col-md-6 first-column">Whats' your Name?</h5>
            <div class="col-md-6">
              <input type="text" v-model="userName" style="width:100%"/>
              <p class="text-danger" v-if="userNameMandatory">Please provide your name</p>
            </div>
          </div>
          <div class="row">
            <h5 class="col-md-6 first-column">What role you play in your team?</h5>
            <div class="col-md-6">
              <select v-model="role" style="width:100%">
                <option v-for="roleItem in roles" :key="roleItem.id"
                        :value="roleItem">{{roleItem.name}}
                </option>
              </select>
            </div>
          </div>

          <div class="row estimate_action">
            <div class="col-md-12">
              <input type="submit" value="Start estimation" class="btn btn-primary" @click="startSession()"/>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
const uuidv4 = require('uuid')
export default {
  name: 'EstimateStarter',
  data () {
    return {
      companyName: '',
      userName: '',
      userId: '',
      role: {id: 1, name: 'Developer'},
      companyNameMandatory: false,
      userNameMandatory: false,
      sessionId: '',
      roles: [
        {id: 1, name: 'Developer'},
        {id: 2, name: 'Quality analyst'},
        {id: 3, name: 'Business analyst'},
        {id: 4, name: 'Project manager'},
        {id: 5, name: 'User experience designer'},
        {id: 6, name: 'User interface developer'},
        {id: 7, name: 'Others'}
      ]
    }
  },
  props: ['display',
    'sessionDetails'],
  updated: function () {
    this.companyName = this.sessionDetails !== null ? this.sessionDetails.companyName : ''
  },
  methods: {

    isMandatoryFieldMissedOut: function (name) {
      return window.util.isEmpty(name)
    },
    initializeSession: function () {
      this.sessionId = uuidv4.v1()
      this.userId = uuidv4.v1()
      let sessionDetails = new SessionStorageUtil.sessionDetails(this.userId, this.userName, this.companyName,
        this.sessionId)
      let personalDetails = new SessionStorageUtil.personalDetails(this.userId, this.userName, this.role.id)
      SessionStorageUtil.savePersonalDetails(sessionDetails, personalDetails)
      firebase.database().ref('estimators/' + this.sessionId).set(sessionDetails)
      firebase.database().ref('estimators/' + this.sessionId + '/users/' + this.userId).set(personalDetails)
      this.$router.push('/estimation/' + this.sessionId)
    },

    startSession: function () {
      this.companyNameMandatory = this.isMandatoryFieldMissedOut(this.companyName)
      this.userNameMandatory = this.isMandatoryFieldMissedOut(this.userName)
      if (this.companyNameMandatory || this.userNameMandatory) return
      if (this.sessionDetails !== null && this.sessionDetails !== undefined && this.sessionDetails.sessionId !== null) {
        this.userId = uuidv4.v1()
        let sessionDetails = this.sessionDetails
        let personalDetails = new SessionStorageUtil.personalDetails(this.userId, this.userName, this.role.id)
        SessionStorageUtil.savePersonalDetails(sessionDetails, personalDetails)
        firebase.database().ref('estimators/' + this.sessionId + '/users/' + this.userId)
          .set(personalDetails)
        this.$emit('close')
        return
      }

      this.initializeSession()
    }
  }
}
</script>

<style lang="css" scoped>
  /* Modal Header */
  .modal-header {
    padding: 2px 16px;
    background-color: #424242;
    color: white;
  }

  /* Modal Body */
  .modal-body {
    padding: 25px 16px;
    background-color: #c48b54;
    color: black;
  }

  /* Modal Content */
  .modal-content {
    position: absolute;
    top: 20%;
    left: 25%;
    width: 50%;
    height: auto;
    align: center;
    overflow: auto;
    background-color: #fefefe;
    margin: auto;
    padding: 0;
    border: 1px solid #888;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    animation-name: animatetop;
    animation-duration: 0.4s
  }

  /* Add Animation */
  @keyframes animatetop {
    from {
      top: -400px;
      opacity: 0
    }
    to {
      top: 20%;
      opacity: 1
    }
  }

  .close {

    height: 20px;
  }

  .first-column {
    text-align: right;
  }

  .row {
    padding-top: 30px;
  }

  .estimate_action {
    padding-top: 50px
  }

  p {
    font-size: 13px;
  }
</style>
