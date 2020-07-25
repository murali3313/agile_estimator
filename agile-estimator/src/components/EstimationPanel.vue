<template>
  <div>
  <md-toolbar layout="row"  class=" md-dense md-theme-demo-light">
    <h1 class="md-title logo-header">Agile Estimator</h1>
    <div class="md-toolbar-section-start  md-toolbar-offset">{{sessionDetails.companyName}}</div>
    <div class="md-toolbar-section-start">Facilitator Name: {{sessionDetails.facilitatorName}}</div>
    <div class="md-toolbar-section-start">User Name: {{userName}}</div>
    <md-button class="md-toolbar-section-end md-alignment-top-center md-elevation-1"
           v-if="isSessionDetailsLoaded && isFacilitator && !finalizeEstimation"
           v-on:click="claimEstimationAttention"
    >Request estimation</md-button>
    <md-button class="md-toolbar-section-end md-alignment-top-center md-elevation-1"
           v-if="isSessionDetailsLoaded && isFacilitator && finalizeEstimation"
           v-on:click="closeEstimationSession"
    >Close Estimation session</md-button>
    <md-button class="md-toolbar-section-end md-alignment-top-center md-elevation-1"
           v-if="isSessionDetailsLoaded"
           v-on:click="showStoryDownloadPanel = true"
    >Download stories</md-button>
    <md-button class="md-toolbar-section-end md-alignment-top-center md-elevation-1"
           v-if="isSessionDetailsLoaded && isFacilitator"
           v-on:click="showStoryUploadPanel = true"
    >Upload stories</md-button>
    <md-button class="md-toolbar-section-end md-alignment-top-center md-elevation-1"
               v-if="isSessionDetailsLoaded && isFacilitator && !finalizeEstimation"
               v-on:click="purgeData"
    >Purge data</md-button>
    <md-button class="md-toolbar-section-end md-alignment-top-center md-elevation-1"
               v-if="isSessionDetailsLoaded && !isFacilitator && !finalizeEstimation"
               v-on:click="claimFacilitation"
    >Claim facilitation</md-button>
  </md-toolbar>
  <div class="container-fluid">
    <div class="row" v-if="currentStoryId !=='' && currentStoryId !==undefined &&currentStoryId !==null">
      <div class="col-md-5 view-port no-padding">
        <StoriesDisplayPanel :session-id="sessionDetails.sessionUUID"
                             :lockMoving="shouldLock()"
                             :applyFilter="applyFilter"
                             :current-story-id="currentStoryId"
                             v-if="sessionDetails.sessionUUID"
                             @showEstimation="displayEstimation=true"
                             @viewDetail="viewStoryDetail(arguments)"
                             @clearFilter="applyFilter = ''"
        ></StoriesDisplayPanel>
      </div>
      <div class="col-md-5 no-padding">
        <StoriesDetailPanel v-if="sessionDetails.sessionUUID" :storyId="currentStoryId">
        </StoriesDetailPanel>
      </div>
      <div class="col-md-2 no-padding">
        <EstimationActionPanel v-if="sessionDetails.sessionUUID"
                               :storyId="claimAttentionStoryId"
                               :displayEstimation="displayEstimation"
                               @applyFilter="applyFilter = arguments[0]">
        </EstimationActionPanel>
      </div>
    </div>
    <p class="no_stories" v-if="currentStoryId ==='' || currentStoryId ==undefined || currentStoryId ===null" >
      Please upload stories to start estimation
    </p>
    <EstimateStarter :display="showDetailCollectionPanel"
                     :sessionDetails="sessionDetails"
                     @close="showDetailCollectionPanel = false"/>
    <StoriesUploader :display="showStoryUploadPanel"
                     :sessionDetails="sessionDetails"
                     @close="showStoryUploadPanel = false"></StoriesUploader>
    <StoriesDownloader :display="showStoryDownloadPanel"
                       :sessionDetails="sessionDetails"
                       @close="showStoryDownloadPanel = false"></StoriesDownloader>
    <EstimationDisplay :display="displayEstimation"
                       :storyId="currentStoryId"
                       :isFacilitator="isFacilitator"
                       :canDiscard="isFacilitator"
                       @close="discardAndClose()"></EstimationDisplay>
    <PurgeData :display="showPurgePanel" @close="showPurgePanel=false"></PurgeData>
  </div>
  </div>
</template>

<script>
import EstimateStarter from './AgileEstimatorSessionStarter'
import StoriesUploader from './BulkImportStoryCards'
import StoriesDisplayPanel from './StoriesDisplayPanel'
import StoriesDetailPanel from './StoriesDetailPanel'
import EstimationActionPanel from './EstimationActionPanel'
import StoriesDownloader from './BulkExportStoryCards'
import EstimationDisplay from './EstimationDisplay'
import PurgeData from './PurgeData'
export default {
  name: 'EstimationPanel',
  data () {
    return {
      estimatorSessionId: '',
      showDetailCollectionPanel: false,
      showStoryUploadPanel: false,
      showStoryDownloadPanel: false,
      sessionDetails: {},
      isSessionDetailsLoaded: false,
      currentStoryId: '',
      userName: '',
      claimAttentionStoryId: '',
      isFacilitator: false,
      displayEstimation: false,
      finalizeEstimation: false,
      applyFilter: '',
      showPurgePanel: false
    }
  },
  components: {
    EstimateStarter,
    StoriesUploader,
    StoriesDownloader,
    StoriesDisplayPanel,
    StoriesDetailPanel,
    EstimationActionPanel,
    EstimationDisplay,
    PurgeData
  },
  created: function () {
    this.estimatorSessionId = this.$route.params.id
    let that = this
    firebase.database().ref('estimators/' + this.estimatorSessionId + '/facilitatorId').on('value', function (facilitatorRef) {
      let facilitatorId = facilitatorRef.val()
      that.isFacilitator = that.isFacilitatorFlag(facilitatorId)
    })
    firebase.database().ref('estimators/' + this.estimatorSessionId).once('value')
      .then(function (sessionDetails) {
        if (SessionStorageUtil.isNewUser()) {
          that.showDetailCollectionPanel = true
        }
        that.sessionDetails = sessionDetails.val()
        that.isSessionDetailsLoaded = true
        that.userName = SessionStorageUtil.getUserName()
        that.isFacilitator = that.isFacilitatorFlag(that.sessionDetails.facilitatorId)
        if (that.sessionDetails.stories) {
          let storyKeyId = Object.keys(that.sessionDetails.stories)[0]
          that.currentStoryId = storyKeyId
          document.body.className = 'panel'
        } else {
          document.body.className = 'home'
        }
      })
    firebase.database().ref('estimators/' + this.estimatorSessionId + '/ClaimAttentionStoryId')
      .on('value', function (storyAttentionClaimRef) {
        that.claimAttentionStoryId = storyAttentionClaimRef.val()
        if (window.util.isNotEmpty(that.claimAttentionStoryId)) {
          that.currentStoryId = storyAttentionClaimRef.val()
        }
        that.finalizeEstimation = window.util.isNotEmpty(that.claimAttentionStoryId)
      })
    firebase.database().ref('estimators/' + this.estimatorSessionId + '/FinalizeEstimation')
      .on('value', function (finalizeEstimationStateRef) {
        let finalEstimationVal = finalizeEstimationStateRef.val()
        if (finalEstimationVal) {
          that.displayEstimation = finalEstimationVal.value
          that.currentStoryId = finalEstimationVal.storyId
        }
      })
  },
  methods: {
    isFacilitatorFlag: function(facilitatorId){
      return facilitatorId === SessionStorageUtil.getUserId()
    },
    viewStoryDetail: function () {
      this.currentStoryId = arguments[0][1]
      window.scrollTo(0, 0)
    },
    claimEstimationAttention: function () {
      firebase.database().ref('estimators/' + this.estimatorSessionId + '/ClaimAttentionStoryId')
        .set(this.currentStoryId)
      firebase.database().ref('estimators/' + this.estimatorSessionId + '/FinalizeEstimation')
        .set({'storyId': this.currentStoryId, value: false})
      this.finalizeEstimation = true
    },
    closeEstimationSession: function () {
      firebase.database().ref('estimators/' + this.estimatorSessionId + '/ClaimAttentionStoryId')
        .set('')
      firebase.database().ref('estimators/' + this.estimatorSessionId + '/FinalizeEstimation')
        .set({'storyId': this.currentStoryId, value: true})
      this.finalizeEstimation = false
    },
    discardAndClose: function () {
      firebase.database().ref('estimators/' + this.estimatorSessionId + '/FinalizeEstimation')
        .set({'storyId': this.currentStoryId, value: false})
      this.displayEstimation = false
    },
    purgeData: function () {
      this.showPurgePanel = true
    },
    claimFacilitation: function () {
      firebase.database().ref('estimators/' + this.estimatorSessionId + '/facilitatorId')
        .set(SessionStorageUtil.getUserId())
      window.location.reload()
    },
    shouldLock: function () {
      return window.util.isNotEmpty(this.claimAttentionStoryId)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1, h2 {
    font-weight: normal;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }

  .showRight {
    float: right;
  }

  .view-port {
    height: 900px;
    overflow-y: scroll;
  }

  .header-block {
    background-color: cadetblue;
    margin: 2px;
    border-radius: 20px;

  }

  .textual-content {
    padding-top: 13px;
    color: white;
  }

  .upload-story {
    background-color: coral;
    margin: 5px;
  }

  .col-md-5 {
    padding: 0px;
    margin: 0px;
  }
  .no-padding {
    padding: 0 !important;
    margin: 0 !important;
    padding-left: 2px !important;
  }
  .logo-header{
    background-image: url('../../src/assets/agile-estimator.png');
    background-position: center;
    padding-left: 5px;
    padding-right: 5px;
  }
  .no_stories{
    padding-top:250px;
    color:white;
    font-size: 30px;
  }

  body{
    background-color: white;
  }
</style>
