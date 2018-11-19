<template>
  <HotTable :settings="config" ref="hotTableComponent"/>
</template>

<script>
import Handsontable from 'handsontable'
import { HotTable } from '@handsontable/vue'

export default {
  data() {
    return {
      config: {
        data: Handsontable.helper.createSpreadsheetData(6, 6),
        colHeaders: true
      }
    }
  },

  components: { HotTable }
}
</script>

<style src="@/../../node_modules/handsontable/dist/handsontable.full.css">
</style>
