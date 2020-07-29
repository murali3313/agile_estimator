<template>
  <div v-if="display">
    <transition name="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h5>Copy and paste your spreadsheet with master story list here.(First row is reserved for headings.) </h5>
          <span class="close" @click="$emit('close')">&times;</span>
        </div>
        <div class="modal-body container-fluid">
          <div class="row">
            <div class="col-md-6">
              <input type="checkbox" class="use-comma " id="useComma" v-model="useCommaSeparationForColumn"/>
              <label for="useComma">Use comma as delimiter instead of tab</label>
              <input type="checkbox" class="use-comma " id="purgeExisting" v-model="purgeExistingStories"/>
              <label for="useComma">Purge existing stories </label>
            </div>
            <p v-if="showErrorMessage" class="text-danger show-right col-md-6">
              Please paste a valid story list copied from any spreadsheet.
            </p>

          </div>
          <div class="row full-area">

            <textarea v-model="storyContent" class="col-md-12 "></textarea>
          </div>
          <div class="row estimate_action">
            <div class="col-md-12">
              <md-button class="md-toolbar-section-center md-alignment-top-center md-elevation-1 btn-accent" @click="createStoryDashBoard()">
                Create story dash board
              </md-button>
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
  name: 'StoriesUploader',
  data () {
    return {
      storyContent: null,
      showErrorMessage: false,
      useCommaSeparationForColumn: false,
      purgeExistingStories: false
    }
  },
  props: ['display', 'sessionDetails'],
  methods: {
    getDelimiter: function () {
      return this.useCommaSeparationForColumn ? ',' : '\t'
    },
    constructStory: function (columnHeaderObj, columnValues) {
      let story = {}
      let validColumnHeaders = columnHeaderObj.getValidColumnHeaders()
      let validColumnValues = columnHeaderObj.getValidColumnValues(columnValues)
      for (let i = 0; i < validColumnHeaders.length; i++) {
        story[i] = {
          'header': validColumnHeaders[i],
          'value':
              (validColumnValues.length > i ? columnValues[i] : '')
        }
      }

      return story
    },
    addStories: function (storiesContent) {
      let that = this
      firebase.database().ref('estimators/' + this.sessionDetails.sessionUUID + '/stories')
        .once('value').then(function (existingStoriesRef) {
          let existingStories = existingStoriesRef.val()
          firebase.database().ref('estimators/' + that.sessionDetails.sessionUUID + '/stories')
            .set({...storiesContent, ...existingStories})
          window.location.reload()
        })
    },
    createStoryDashBoard: function () {
      if (window.util.isEmpty(this.storyContent)) {
        this.showErrorMessage = true
        return
      }
      this.showErrorMessage = false
      let storiesContext = new StoriesContext(this.storyContent, this.useCommaSeparationForColumn)

      let storiesContent = storiesContext.getStories()
      let that = this
      if (this.purgeExistingStories) {
        firebase.database().ref('estimators/' + this.sessionDetails.sessionUUID + '/stories')
          .set({}).then(function () {
            that.addStories(storiesContent)
          })
      } else {
        this.addStories(storiesContent)
      }

      this.$emit('close')
    }
  }
}
let StoriesContext = function (storyContent, isCommaSeparated) {
  const techColumns = ['user_estimates', 'final_estimate']

  let getColumnDelimiter = function () {
    return isCommaSeparated ? ',' : '\t'
  }

  let getHeaderRowDelimiter = function () {
    return '\n'
  }
  let headerRow = storyContent.split(getHeaderRowDelimiter())[0]
  let getStorySplit = function (storyContent, headerValues) {
    let onlyStoryContent = storyContent.split(getHeaderRowDelimiter()).slice(1).join(getHeaderRowDelimiter())
    let stories = []
    let allColumns = onlyStoryContent.split(getColumnDelimiter())
    let allTrueColumns = []
    allColumns.forEach(function (column) {
      if (column.startsWith('"')) {
        allTrueColumns.push(column)
      } else {
        let existenceOfEnterKeyInSameColumn = column.split('\n')
        if (existenceOfEnterKeyInSameColumn.length === 2) {
          allTrueColumns.push(existenceOfEnterKeyInSameColumn[0])
          allTrueColumns.push(existenceOfEnterKeyInSameColumn[1])
        } else {
          allTrueColumns.push(column)
        }
      }
    })

    let storyRowColumns = []
    allTrueColumns.forEach(function (trueColumn, index) {
      storyRowColumns.push(trueColumn)
      if ((index + 1) % headers.length === 0) {
        stories.push(storyRowColumns.join(getColumnDelimiter()))
        storyRowColumns = []
      }
    })
    return stories
  }

  let columnIndicesForTechColumns = {}
  let validColumnIndices = (function () {
    let validColumnIndices = []
    let columns = headerRow.split(getColumnDelimiter())
    for (let i = 0; i < columns.length; i++) {
      if (window.util.isNotEmpty(columns[i])) {
        validColumnIndices.push(i)
      }
      if (techColumns.includes(columns[i])) {
        columnIndicesForTechColumns[columns[i]] = i
      }
    }
    return validColumnIndices
  }())

  let headers = (function () {
    let columns = headerRow.split(getColumnDelimiter())
    return validColumnIndices.map(function (validIndex) { return columns[validIndex] })
  }())

  let getOnlyNonTechnicalHeaders = function (headers) {
    let nonTechColumns = []
    headers.forEach(function (column) {
      if (column !== 'user_estimates' && column !== 'final_estimate') {
        nonTechColumns.push(column)
      }
    })
    return nonTechColumns
  }

  let storiesContent = {
    storyConfig: {
      displayColumnNumbers: [0, 1],
      headerColumnValues: getOnlyNonTechnicalHeaders(headers)
    }
  }
  let storyOnlySplit = getStorySplit(storyContent)
  let values = (function () {
    return storyOnlySplit.map(function (story) {
      let columns = story.split(getColumnDelimiter())
      return validColumnIndices.map(function (validIndex) { return columns[validIndex] })
    })
  }())

  let parsedJsonEstimates = function (value) {
    try {
      return JSON.parse(value.replace(/\*/g, '"'))
    } catch (e) {
      return ''
    }
  }
  let getUserEstimates = function (storyEntry) {
    if (!columnIndicesForTechColumns['user_estimates']) {
      return ''
    }
    let value = storyEntry[columnIndicesForTechColumns['user_estimates']]
    return window.util.isEmpty(value) ? '' : parsedJsonEstimates(value)
  }
  let getFinalEstimate = function (storyEntry) {
    if (!columnIndicesForTechColumns['final_estimate']) {
      return ''
    }
    let value = storyEntry[columnIndicesForTechColumns['final_estimate']]
    return window.util.isEmpty(value) ? '' : value.replace(/\n/g, '')
  }
  this.getStories = function () {
    values.forEach(function (row) {
      let story = {}
      row.forEach(function (column, index) {
        if (!Object.values(columnIndicesForTechColumns).includes(index)) {
          story[index] = {
            'header': headers[index],
            'value': window.util.isEmpty(column) ? '' : column.replace(/"/g, '')
          }
        }
      })
      story['user_estimates'] = getUserEstimates(row)
      story['final_estimate'] = getFinalEstimate(row)
      storiesContent[uuidv4.v1()] = story
    })
    return storiesContent
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
  .btn-accent{
    background-color: #724c27;
  }
</style>
