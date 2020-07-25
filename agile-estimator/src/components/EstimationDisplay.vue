<template>
  <div v-if="display">
    <transition name="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h5>View estimation. Now, collaborate and finalize the estimation</h5>
          <input type="button" class="btn discard-finalize" value="Discard finalization" v-if="canDiscard"
                 @click="$emit('close')"/>
        </div>
        <div class="modal-body container-fluid">
          <div class="row content">
            <div class="col-md-5 right-border">
              <h4>User estimates</h4>
              <div class="container-fluid">
                <div class="row user-estimate-container" v-for="(userEstimate,key) in bySize" v-bind:key="key">
                  <div class="estimate-extra-styles">
                    <div class="container-fluid">
                      <div class="row">
                        <div v-bind:class="key.toLowerCase()">{{key.toUpperCase()}}</div>
                      </div>
                      <div class="row user-names">
                        {{userEstimate}}

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-7">
              <div >
                <h4 class="finalize">Finalize the estimate</h4>
                <p>(Only facilitator can finalize)</p>
                <div class="row">

                  <div class="estimate-extra-styles col-md-2"
                       v-bind:class="'all-estimate-'+ key.toLowerCase() "
                       v-for="(_,key) in allEstimates" v-bind:key="key"
                       @click="updateFinalEstimate(key)">
                    <div class="container-fluid all-estimate">
                      <div class="row" v-bind:class="(finalEstimate == key?key.toLowerCase()+'-background-effect':' ')">
                        <div
                          v-bind:class="key.toLowerCase()+ (finalEstimate == key?' estimate-selected md-elevation-24 ':' ')">
                          {{key.toUpperCase()}}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row" style="float:right;">
                  <input type="button" class="btn finalize-action"
                         value="Finalize Estimate" @click="finalizeEstimate()"
                         v-if="isFinalEstimateExists()"/>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'EstimationDisplay',
  data () {
    return {
      userEstimates: {},
      finalEstimate: '',
      bySize: {},
      allEstimates: {'XS': '', 'S': '', 'M': '', 'L': '', 'XL': '', 'XXL': ''}
    }
  },
  props: ['display', 'storyId', 'canDiscard', 'isFacilitator'],
  watch: {
    storyId: function () {
      this.estimatorSessionId = this.$route.params.id
      let that = this
      firebase.database().ref('estimators/' + this.estimatorSessionId + '/stories/' + this.storyId)
        .on('value', function (storyRef) {
          let storyObject = storyRef.val()
          if (storyObject) {
            that.userEstimates = storyObject.user_estimates
            that.finalEstimate = storyObject.final_estimate
          }
          that.bySize = that.getEstimateBySize()
        })
      firebase.database().ref('estimators/' + this.estimatorSessionId + '/FinalizeProgress').on('value', function (progressRef) {
        let progressEstimate = progressRef.val()
        that.finalEstimate = progressEstimate
      })
    }
  },
  methods:
      {

        isFinalEstimateExists: function () {
          return this.isFacilitator && window.util.isNotEmpty(this.finalEstimate)
        },
        getEstimateBySize: function () {
          let bySize = {}
          if (this.userEstimates) {
            Object.entries(this.userEstimates).forEach(function (entry) {
              if (bySize[entry[1]] === undefined) {
                bySize[entry[1]] = entry[0]
              } else {
                bySize[entry[1]] += ', ' + entry[0]
              }
            })
          }
          debugger
          return bySize
        },
        updateFinalEstimate: function (estimate) {
          if (!this.isFacilitator) {
            return
          }
          if (this.finalEstimate !== estimate) {
            this.finalEstimate = estimate
          } else {
            this.finalEstimate = ''
          }
          firebase.database().ref('estimators/' + this.estimatorSessionId + '/FinalizeProgress')
            .set(this.finalEstimate)
        },
        finalizeEstimate: function () {
          debugger
          firebase.database().ref('estimators/' + this.estimatorSessionId + '/FinalizeEstimation')
            .set({'storyId': this.storyId, value: false})
          firebase.database().ref('estimators/' + this.estimatorSessionId + '/stories/' + this.storyId + '/final_estimate')
            .set(this.finalEstimate)
          firebase.database().ref('estimators/' + this.estimatorSessionId + '/ref_stories/' + this.storyId)
            .set(this.finalEstimate)
          this.$emit('close')
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
    top: 10%;
    left: 10%;
    width: 80%;
    height: auto;
    align: center;
    overflow: auto;
    background-color: #424242;
    margin: auto;
    padding: 0;
    border: 1px solid #888;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    animation-name: animatetop;
    animation-duration: 0.4s;
    color:white;
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

  p {
    font-size: 13px;
  }

  .finalize-action, .discard-finalize {
    padding: 5px;
    background-color: #724c27;
    color: white;
    margin: 5px;
  }
  .right-border{
    border-right: solid 1px gray;
  }


  .finalize-action {
    margin-top: 50px;
  }

  .xs, .s, .m, .l, .xl, .xxl {
    display: inline-block;
    margin: 0 auto;
    border-radius: 50%;
    cursor: pointer;
    color: black;
  }

  .xs {
    height: 2em;
    width: 2em;
    line-height: 2em;
    background-color: #efe9cf;

  }

  .s {
    height: 3em;
    width: 3em;
    line-height: 3em;
    background-color: #e2d6ab;
  }

  .m {
    height: 4em;
    width: 4em;
    line-height: 4em;
    background-color: #ddbe9b;
  }

  .l {
    height: 5em;
    width: 5em;
    line-height: 5em;
    background-color: #be9f44;
  }

  .xl {
    height: 5.5em;
    width: 5.5em;
    line-height: 5.5em;
    background-color: #be7f41;
  }

  .xxl {
    height: 6em;
    width: 6em;
    line-height: 6em;
    background-color: #986534;

  }

  .user-names {
    margin: 0 auto;
    display: inline-block;
  }

  .user-estimate-container {
    margin: 0 auto;
    display: inline;
    padding-top: 20px;
  }

  .estimate-extra-styles {
    padding-left: 20px;
  }

  .all-estimate-xs {
    padding-top: 65px;
  }

  .all-estimate-s {
    padding-top: 49px;
  }

  .all-estimate-m {
    padding-top: 33px
  }

  .all-estimate-l {
    padding-top: 17px;
  }

  .all-estimate-xl {
    padding-top: 9px;
  }

  .estimate-selected {
  }

  .m-background-effect{
    background-color: antiquewhite;
    border-radius: 50%;
    height: 79px;
    width: 79px;
    padding-top: 12px;
    padding-left: 2px;
  }
  .xs-background-effect{
    background-color: antiquewhite;
    border-radius: 50%;
    height: 50px;
    width: 50px;
    padding-top: 12px;
    padding-left: 2px;
    color:black;
  }
  .s-background-effect{
    background-color: antiquewhite;
    border-radius: 50%;
    height: 65px;
    width: 65px;
    padding-top: 12px;
    padding-left: 2px;
  }
  .m-background-effect{
    background-color: antiquewhite;
    border-radius: 50%;
    height: 80px;
    width: 80px;
    padding-top: 12px;
    padding-left: 2px;
  }
  .l-background-effect{
    background-color: antiquewhite;
    border-radius: 50%;
    height: 95px;
    width: 95px;
    padding-top: 12px;
    padding-left: 2px;
  }
  .xl-background-effect{
    background-color: antiquewhite;
    border-radius: 50%;
    height: 99px;
    width: 99px;
    padding-top: 12px;
    padding-left: 2px;
  }
  .xxl-background-effect{
    background-color: antiquewhite;
    border-radius: 50%;
    height: 105px;
    width: 105px;
    padding-top: 12px;
    padding-left: 2px;
  }
</style>
