<template>
  <div class="container-fluid">
    <div class="row header-block">
      <div class="col-md-2 textual-content"><strong>{{sessionDetails.companyName}}</strong></div>
      <div class="col-md-2 textual-content"><strong> Facilitator Name: {{sessionDetails.facilitatorName}}</strong></div>
      <div class="col-md-2 textual-content"><strong> User Name: {{userName}}</strong></div>
      <div class="col-md-*">
        <input type="button" class="btn upload-story showRight"
               value="Request estimation"
               v-if="isSessionDetailsLoaded && isFacilitator && !finalizeEstimation"
               v-on:click="claimEstimationAttention"
        >
        <input type="button" class="btn upload-story showRight"
               value="Close Estimation session"
               v-if="isSessionDetailsLoaded && isFacilitator && finalizeEstimation"
               v-on:click="closeEstimationSession"
        >
      </div>
      <div class="col-md-*">
        <input type="button" class="btn upload-story showRight"
               value="Download story info"
               v-if="isSessionDetailsLoaded"
               v-on:click="showStoryDownloadPanel = true"
        >
      </div>
      <div class="col-md-*">

        <input type="button" class="btn upload-story showRight"
               value="Upload story cards"
               v-if="isSessionDetailsLoaded && isFacilitator"
               v-on:click="showStoryUploadPanel = true"
        >

      </div>
    </div>
    <div class="row">
      <div class="col-md-5 view-port">
        <StoriesDisplayPanel :session-id="sessionDetails.sessionUUID"
                             :lockMoving="claimAttentionStoryId!==''"
                             :applyFilter="applyFilter"
                             v-if="sessionDetails.sessionUUID"
                             @showEstimation="displayEstimation=true"
                             @viewDetail="viewStoryDetail(arguments)"
                             @clearFilter="applyFilter = ''"
        ></StoriesDisplayPanel>
      </div>
      <div class="col-md-5">
        <StoriesDetailPanel v-if="sessionDetails.sessionUUID" :storyId="currentStoryId">
        </StoriesDetailPanel>
      </div>
      <div class="col-md-2 view-port">
        <EstimationActionPanel v-if="sessionDetails.sessionUUID"
                               :storyId="claimAttentionStoryId"
                               :displayEstimation="displayEstimation"
                               @applyFilter="applyFilter = arguments[0]">
        </EstimationActionPanel>
      </div>
    </div>
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
      applyFilter: ''
    }
  },
  components: {
    EstimateStarter,
    StoriesUploader,
    StoriesDownloader,
    StoriesDisplayPanel,
    StoriesDetailPanel,
    EstimationActionPanel,
    EstimationDisplay
  },
  created: function () {
    this.estimatorSessionId = this.$route.params.id

    let that = this
    firebase.database().ref('estimators/' + this.estimatorSessionId).once('value')
      .then(function (sessionDetails) {
        if (SessionStorageUtil.isNewUser()) {
          that.showDetailCollectionPanel = true
        }
        that.sessionDetails = sessionDetails.val()
        that.isSessionDetailsLoaded = true
        that.userName = SessionStorageUtil.getUserName()
        that.isFacilitator = that.sessionDetails.facilitatorId === SessionStorageUtil.getUserId()
        let storyKeyId = Object.keys(that.sessionDetails.stories)[0]
        that.currentStoryId = storyKeyId
      })
    firebase.database().ref('estimators/' + this.estimatorSessionId + '/ClaimAttentionStoryId')
      .on('value', function (storyAttentionClaimRef) {
        that.claimAttentionStoryId = storyAttentionClaimRef.val()
        if (that.claimAttentionStoryId !== '') {
          that.currentStoryId = storyAttentionClaimRef.val()
        }
        this.finalizeEstimation = that.claimAttentionStoryId !== ''
      })
    firebase.database().ref('estimators/' + this.estimatorSessionId + '/FinalizeEstimation')
      .on('value', function (finalizeEstimationStateRef) {
        that.displayEstimation = finalizeEstimationStateRef.val().value
        that.currentStoryId = finalizeEstimationStateRef.val().storyId
      })
  },
  methods: {
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
</style>
