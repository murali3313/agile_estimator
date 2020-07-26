<template>
  <div class="base-color" >
    <md-toolbar layout="row"  class=" md-dense md-theme-demo-light">
      <h1 class="md-title logo-header">Agile Estimator</h1>
      <div class="md-toolbar-section-start  md-toolbar-offset"></div>
      <md-button class="md-toolbar-section-end md-raised md-alignment-top-right md-elevation-24 btn-home"
                 v-on:click="startANewSession"
      >Start estimation</md-button>
    </md-toolbar>
    <img :src="require('../assets/agile-estimator.png')"
         class="start_estimator" v-on:click="startANewSession" />

    <EstimateStarter :display="showModal" @close="showModal =false" />
</div>

</template>

<script>
import EstimateStarter from './AgileEstimatorSessionStarter.vue'
export default {
  name: 'Agile_Estimator_Home',
  data () {
    return {
      msg: 'Welcome to Agile estimator',
      showModal: false
    }
  },
  components: {EstimateStarter},
  methods: {
    startANewSession: function () {
      this.showModal = true
    }
  },
  beforeCreate: function () {
    document.body.className = 'home'
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
.start_estimator{
  border-radius: 50%;
  width:200px;
  height:200px;
  position:absolute;
  top:45%;
  left:45%;
}
  .base-color{
    background-color: #424242;
    color: white;
  }
.logo-header{
  background-image: url('../../src/assets/agile-estimator.png');
  background-position: center;
  padding-left: 5px;
  padding-right: 5px;
}

</style>
