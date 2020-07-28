<template>
  <div v-if="display">
    <transition name="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h6>Click header columns to be displayed in your left pane</h6>
          <span class="close" @click="$emit('close')">&times;</span>
        </div>
        <div class="modal-body container-fluid">
          <div class="row">
            <div v-for="(headerColumn,index) in storyConfig.headerColumnValues" @click="addOrRemoveColumns(index)"
                 :class="getStyle(index)">
              {{headerColumn}}
            </div>
          </div>
          <div>
            <p class="text-danger" v-if="moreColumns">Sorry cannot add more than 2 columns!!</p>
          </div>
          <div class="row selected-headers">

            <div class="col-md-* included" v-for="displayColumnNumber in storyConfig.displayColumnNumbers"
                 @click="addOrRemoveColumns(displayColumnNumber)">
              {{storyConfig.headerColumnValues[displayColumnNumber]}}
            </div>
          </div>
          <div class="row estimate_action">
            <div class="col-md-12">
              <input type="submit" value="Save settings" class="btn btn-primary"
                     @click="saveSettings()"/>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'StoriesDisplaySettings',
  data () {
    return {
      moreColumns: false
    }
  },
  props: ['display', 'storyConfig'],
  methods: {
    getStyle: function (index) {
      return 'col-md-* ' + (this.storyConfig.displayColumnNumbers.includes(index) ? 'included' : 'not-included')
    },
    addOrRemoveColumns: function (columnHeaderIndex) {
      this.moreColumns = false
      if (this.storyConfig.displayColumnNumbers.includes(columnHeaderIndex)) {
        this.storyConfig.displayColumnNumbers = this.storyConfig.displayColumnNumbers.filter(function (i) {
          return i !== columnHeaderIndex
        })
      } else {
        if (this.storyConfig.displayColumnNumbers.length === 2) {
          this.moreColumns = true
          return
        }
        this.storyConfig.displayColumnNumbers.push(columnHeaderIndex)
      }
    },
    saveSettings: function () {
      firebase.database().ref('estimators/' + this.$route.params.id +
        '/stories/storyConfig')
        .set(this.storyConfig)
      this.$emit('close')
    }
  }
}
</script>

<style lang="css" scoped>
  /* Modal Header */
  .modal-header {
    padding: 2px 16px;
    background-color: #4F518C;
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
    height: 500px;
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
      top: -100px;
      opacity: 0
    }
    to {
      top: 30px;
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

  .included, .not-included {
    margin: 2px;
    padding: 2px;
    border-radius: 5px;
    background-color: #FF6B6B;
  }

  .not-included {
    background-color: #888888;
  }

  .selected-headers{
    margin:20px 20px 50px 20px;
    padding:20px;
    border-color: #FF6B6B;
    border-style: solid;
    border-width: thin;
  }
</style>
