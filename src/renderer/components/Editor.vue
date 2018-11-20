<template>
  <HotTable :settings="config" ref="hotTableComponent"/>
</template>

<script>
import Encoder from 'encoding-japanese'
import Papa from 'papaparse'
import Handsontable from 'handsontable'
import { HotTable } from '@handsontable/vue'
import { ipcRenderer } from 'electron'

export default {
  data() {
    return {
      file: {
        bytes:   null,
        text:    null,
        path:    null,
        encode:  'UTF8',
        newline: 'NL'
      },

      config: {
        data: Handsontable.helper.createSpreadsheetData(6, 6),
        colHeaders: true
      },

      encoding: {
        'UTF8':  'UTF-8',
        'EUCJP': 'EUC-JP',
        'SJIS':  'Shift_JIS'
      },
      newline: {
        CRLF: 'CRLF',
        CR:   'CR',
        LF:   'LF'
      }
    }
  },

  components: { HotTable },

  mounted() {
    ipcRenderer.on('send-file-contents', (e, file_info) => {
      this.file.bytes  = file_info.bytes
      this.file.path   = file_info.path
      this.file.encode = Encoder.detect(this.file.bytes)
      this.file.text   = Encoder.convert(this.file.bytes, {
        from: this.file.encode,
        to:   'UNICODE',
        type: 'string'
      })

      let table = this.$refs.hotTableComponent.hotInstance
      table.loadData(Papa.parse(this.file.text.trim()).data)
    })
  }
}
</script>

<style src="@/../../node_modules/handsontable/dist/handsontable.full.css">
</style>
