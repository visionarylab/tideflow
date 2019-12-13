import filesLib from '/imports/modules/files/server/lib'
import { servicesAvailable } from '/imports/services/_root/server'
const slugify = require('slugify')

const service = {
  name: 'file',
  inputable: false,
  stepable: true,
  ownable: false,
  hooks: {
    // service: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'create-input-log-file',
      visibe: true,
      callback: (user, currentStep, executionLogs, execution, logId, cb) => {
        let previousStepsData = executionLogs.map(el => el.stepResult)

        previousStepsData.map(data => {
          if (data.type === 'file') data.data.data = '...'
        })

        const fileName = slugify(`${execution.fullFlow.title} ${execution._id.substring(0, 3)}`).toLowerCase()

        filesLib.create({
          user: user._id,
          name: `${fileName}.json`
        }, JSON.stringify(previousStepsData, ' ', 2))

        cb(null, {
          result: {
            type: 'file',
            data: {
              fileName: `${fileName}.json`,
              data: Buffer.from(JSON.stringify(previousStepsData, ' ', 2), 'utf-8')
            }
          },
          next: true,
          error: false,
          msgs: [{
            m: 's-file.log.create-input-log-file.created',
            p: [],
            d: new Date()
          }]
        })
      }
    },

    {
      name: 'read-file',
      visibe: true,
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        try {
          const file = await filesLib.getOne({
            _id: currentStep.config.file
          })
          const string = await filesLib.getOneAsString({
            _id: file._id
          })

          cb(null, {
            result: {
              type: 'file',
              data: {
                fileName: file.name,
                data: Buffer.from(string, 'utf-8')
              }
            },
            next: true,
            error: false,
            msgs: [{
              m: 's-file.log.read-file.readed',
              p: [],
              d: new Date()
            }]
          })
        } catch (ex) {
          cb(null, {
            result: {},
            next: true,
            error: true,
            msgs: [{
              m: 's-file.log.read-file.retrieveFailed',
              p: [],
              d: new Date(),
              e: true
            }]
          })
        }


      }
    },

    {
      name: 'store-previous-files',
      visibe: true,
      callback: (user, currentStep, executionLogs, execution, logId, cb) => {
        let previousFiles = executionLogs.map(el => el.stepResult).filter(el => el.type === 'file')
        
        let fileNames = []

        previousFiles.map(file => {
          const fileName = slugify(`${execution._id.substring(0, 3)}-${file.data.fileName}`).toLowerCase()
          fileNames.push(fileName)
          return filesLib.create({
            user: user._id,
            name: fileName
          }, new Buffer(file.data.data))
        })

        cb(null, {
          result: {
            type: 'object',
            data: {
              fileNames
            }
          },
          next: true,
          error: false,
          msgs: [{
            m: 's-file.log.store-previous-files.created',
            p: [fileNames.length],
            d: new Date()
          }]
        })
      }
    },
  ]
}

module.exports.service = service

servicesAvailable.push(service)
