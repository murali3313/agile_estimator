<template>
  <div class="container-fluid" v-bind:class="{'activate': activateEstimation}">
    <div class="row">
      <h5>{{activateEstimation?'Wats ur estimate?':'Reference Stories'}}</h5>
      <img :src="require('../assets/estimate.gif')" class="point-out" v-if="activateEstimation"/>
    </div>
    <div class="row">
      <h4 v-if="activateEstimation" class="estimate"> {{estimation}}</h4>
    </div>
    <div class="row">
      <div class="xs" v-on:click="estimate('XS')">XS</div>
    </div>
    <div class="row">
      <div class="s" v-on:click="estimate('S')">S</div>
    </div>
    <div class="row">
      <div class="m" v-on:click="estimate('M')">M</div>
    </div>
    <div class="row">
      <div class="l" v-on:click="estimate('L')">L</div>
    </div>
    <div class="row">
      <div class="xl" v-on:click="estimate('XL')">XL</div>
    </div>
    <div class="row">
      <div class="xxl" v-on:click="estimate('XXL')">XXL</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EstimationActionPanel',
  data () {
    return {
      activateEstimation: false,
      estimatorSessionId: '',
      estimation: ''
    }
  },
  components: {},
  props: ['storyId', 'displayEstimation'],
  methods: {
    estimate: function (estimation) {
      this.estimatorSessionId = this.$route.params.id
      this.estimation = estimation
      if (this.activateEstimation) {
        firebase.database()
          .ref('estimators/' + this.estimatorSessionId + '/stories/' + this.storyId + '/user_estimates/' + SessionStorageUtil.getUserName())
          .set(estimation)
      } else {
        debugger
        this.$emit('applyFilter', estimation)
      }
    }
  },
  mounted: function () {
    this.activateEstimation = this.storyId !== null && this.storyId !== undefined && this.storyId !== ''
  },
  watch: {
    storyId: function () {
      this.activateEstimation = this.storyId !== null && this.storyId !== undefined && this.storyId !== ''
      this.estimation = ''
    }
  }
}
</script>

<style lang="css" scoped>

  .activate{
    background-color: #FF6B6B;
    background-image: linear-gradient(to right, #FF6B6B 0%, #FF6B1A 100%);
  }
  .row {
    padding: 10px;
  }

  .estimate {
    display: inline-block;
    margin: 0 auto;
    width:100px;
    padding:2px;
    border-radius: 1%;
    background-color: mediumslateblue;
    cursor: pointer;
    color:white;
    min-height: 30px;
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
  .point-out{
    width: 40px;
    height: 40px;
    margin-left: -50px;
    position: fixed;
    margin-top: 27px;

  }

</style>
