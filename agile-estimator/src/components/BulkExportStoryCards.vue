<template>
  <div v-if="display">
    <transition name="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h5>Please copy the below text and paste it in any spreadsheet program!!</h5>
          <span class="close" @click="$emit('close')">&times;</span>
        </div>
        <div class="modal-body container-fluid">
          <div class="row">
            <div class="col-md-6">
              <input type="checkbox" class="use-comma " id="useComma" v-model="useCommaSeparationForColumn"/>
              <label for="useComma">Use comma as delimiter instead of tab</label>
            </div>
          </div>
          <div class="row full-area">
            <textarea v-model="storyContent" class="col-md-12 "></textarea>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'StoriesDownloader',
  data () {
    return {
      storyContent: null,
      useCommaSeparationForColumn: false
    }
  },
  props: ['display', 'sessionDetails'],
  watch: {
    display: function () {
      if (!this.display) {
        return
      }
      let that = this
      this.storyContent = ''
      firebase.database().ref('estimators/' + this.sessionDetails.sessionUUID + '/stories')
        .once('value').then(function (storiesRef) {
          let storiesJson = storiesRef.val()
          let outputStoryContent = ''
          let stroyConfig = storiesJson.storyConfig
          stroyConfig.headerColumnValues.push('user_estimates')
          stroyConfig.headerColumnValues.push('final_estimate')
          outputStoryContent += stroyConfig.headerColumnValues.join(that.getDelimiter())
          outputStoryContent += '\n'
          Object.entries(storiesJson).forEach(function (entry) {
            if (entry[0] !== 'storyConfig') {
              outputStoryContent += stroyConfig.headerColumnValues.map(function (header, index) {
                if (header === 'user_estimates') {
                  return JSON.stringify(entry[1]['user_estimates'])
                }
                if (header === 'final_estimate') {
                  return entry[1]['final_estimate']
                }
                return '"' + entry[1][index].value + '"'
              }).join(that.getDelimiter())
              outputStoryContent += '\t\n'
            }
          })
          that.storyContent = outputStoryContent
        })
    }
  },
  methods:
      {
        getDelimiter: function () {
          return this.useCommaSeparationForColumn ? ',' : '\t'
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

  }

  /* Modal Content */
  .modal-content {
    position: absolute;
    top: 12%;
    left: 10%;
    width: 80%;
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

  .estimate_action {
    height: 5%;
    padding-top: 10px;
  }

  p {
    font-size: 13px;
  }

  .full-area {
    height: 500px;
    padding: 5px;
  }

  .use-comma {
    margin-top: 5px;
    padding-left: 5px;
  }

  .show-right {
    float: right
  }
</style>
