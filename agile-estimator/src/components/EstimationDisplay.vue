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
            <h4>User estimates</h4>
            <div class="container-fluid">
              <div class="row">
                <div class="estimate-extra-styles" v-bind:class="'col-md-'+ 12 / Object.keys(bySize).length " v-for="(userEstimate,key) in bySize" v-bind:key="key">
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
          <div v-if=" isFacilitator">
          <h4 class="finalize">Choose and finalize the estimate (Only facilitator can finalize)</h4>
          <div class="row">

            <div class="estimate-extra-styles col-md-2"
                 v-bind:class="'all-estimate-'+ key.toLowerCase() "
                 v-for="(_,key) in allEstimates" v-bind:key="key"
            @click="updateFinalEstimate(key)">
              <div class="container-fluid all-estimate">
                <div class="row">
                  <div v-bind:class="key.toLowerCase()+ (finalEstimate == key?' estimate-selected ':' ')">{{key.toUpperCase()}}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="row" style="float:right;">
            <input type="button" class="btn finalize-action"
                   value="Finalize Estimate" @click="finalizeEstimate()" v-if="finalEstimate !== '' "/>

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
  props: ['display', 'storyId', 'canDiscard','isFacilitator'],
  watch: {
    storyId: function () {
      this.estimatorSessionId = this.$route.params.id
      let that = this
      firebase.database().ref('estimators/' + this.estimatorSessionId + '/stories/' + this.storyId)
        .on('value', function (storyRef) {
          let storyObject = storyRef.val()
          that.userEstimates = storyObject.user_estimates
          that.finalEstimate = storyObject.final_estimate
          that.bySize = that.getEstimateBySize()
        })
    }
  },
  methods:
      {
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
          return bySize
        },
        updateFinalEstimate: function (estimate) {
          if (this.finalEstimate !== estimate) {
            this.finalEstimate = estimate
          } else {
            this.finalEstimate = ''
          }
        },
        finalizeEstimate: function () {
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
    background-color: #4F518C;
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
    height: 80%;
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

  p {
    font-size: 13px;
  }

  .finalize-action,.discard-finalize {
    padding: 5px;
    background-color: coral;
    margin: 5px;
  }
  .finalize-action{
    margin-top:50px;
  }

  .xs, .s, .m, .l, .xl, .xxl {
    display: inline-block;
    margin: 0 auto;
    border-radius: 50%;
    background-color: #42b983;
    cursor: pointer;
  }

  .xs {
    height: 2em;
    width: 2em;
    line-height: 2em;

  }

  .s {
    height: 3em;
    width: 3em;
    line-height: 3em;

  }

  .m {
    height: 4em;
    width: 4em;
    line-height: 4em;
  }

  .l {
    height: 5em;
    width: 5em;
    line-height: 5em;
  }

  .xl {
    height: 5.5em;
    width: 5.5em;
    line-height: 5.5em;

  }

  .xxl {
    height: 6em;
    width: 6em;
    line-height: 6em;

  }
  .user-names{
    margin: 0 auto;
    display: inline-block;
  }

  .estimate-extra-styles {
    padding-left: 20px;
  }
  .finalize{
    padding-top:150px;
  }

  .all-estimate-xs {
    padding-top:65px;
  }
  .all-estimate-s {
    padding-top:49px;
  }
  .all-estimate-m {
    padding-top:33px
  }
  .all-estimate-l {
    padding-top:17px;
  }
  .all-estimate-xl {
    padding-top:9px;
  }
  .estimate-selected{
    background-color: #FF6B6B;
    color: white;
  }
</style>
