<template>
  <div>
    <label for="encoding">Encode: </label>
    <select id="encoding" v-model="file.encode">
      <option v-for="(value, key) in encoding" :value="key">
        {{ value }}
      </option>
    </select>

    <label for="newline">Line Ends: </label>
    <select id="newline" v-model="file.newline">
      <option v-for="(value, key) in newline" :value="key">
        {{ value }}
      </option>
    </select>

    <HotTable :settings="config" ref="hotTableComponent"/>
  </div>
</template>

<script>
import Encoder from 'encoding-japanese'
import Papa from 'papaparse'
import Handsontable from 'handsontable'
import { HotTable } from '@handsontable/vue'
import { ipcRenderer } from 'electron'
import NewLine from '@/utilities/NewLine'

export default {
  data() {
    return {
      file: {
        bytes:   null,
        text:    null,
        path:    null,
        encode:  'UTF8',
        newline: 'LF'
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

  methods: {
    parseCSV() {
      this.file.text = Encoder.convert(this.file.bytes, {
        from: this.file.encode,
        to:   'UNICODE',
        type: 'string'
      })

      return Papa.parse(this.file.text.trim()).data
    },

    unparseCSV() {
      let table = this.$refs.hotTableComponent.hotInstance
      return Papa.unparse(table.getData(), {
        newline: NewLine.decode(this.file.newline)
      })
    }
  },

  watch: {
    'file.encode': function(newVal) {
      let table = this.$refs.hotTableComponent.hotInstance
      table.loadData(this.parseCSV())
    }
  },

  components: { HotTable },

  mounted() {
    ipcRenderer.on('send-file-contents', (e, file_info) => {
      this.file.bytes  = file_info.bytes
      this.file.path   = file_info.path
      this.file.encode = Encoder.detect(this.file.bytes)

      let table = this.$refs.hotTableComponent.hotInstance
      table.loadData(this.parseCSV())
    })

    ipcRenderer.on('save-file', (e, arg) => {
      this.file.text = this.unparseCSV()
      this.file.bytes = new Uint8Array(
        Encoder.convert(Encoder.stringToCode(this.file.text), {
          from: 'UNICODE',
          to:   this.file.encode,
          type: 'arraybuffer'
        })
      )
      console.dir(this.file)

      ipcRenderer.send('save-data', this.file)
    })
  }
}
</script>

<style src="@/../../node_modules/handsontable/dist/handsontable.full.css">
</style>
