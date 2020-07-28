<template>
  <div v-if="display">
    <transition name="modal">
      <div class="modal-content">
        <div class="modal-header ">
          <h4>Tell us some basic info to start your estimation!!</h4>
          <span class="close rowColor" @click="$emit('close')">&times;</span>
        </div>
        <div class="modal-body container-fluid">
          <div id="firebaseui-auth-container"></div>
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
    var uiConfig = {
      signInSuccessUrl: window.location,
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
      ]
    }

    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth())
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig)
    let that = this
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        that.userName = user.displayName
        that.userId = user.uid
        that.initializeSession()
      } else {
        // User is signed out.
        // ...
      }
    })
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
    background-color:  #fefefe;
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
