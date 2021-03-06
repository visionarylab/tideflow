import i18n from 'meteor/universe:i18n'
import { Template } from 'meteor/templating'
import { sAlert } from 'meteor/juliancwirko:s-alert'

/**
 * Runs a workaround for copying text to the clipboard if the browser
 * doesn't have native clipboard support.
 * 
 * @param {String} text The content to be copied into the clipboard.
 */
function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    var successful = document.execCommand('copy')
    if (successful) {
      sAlert.success(`${i18n.__('clipboard.textCopied')} ${text}`)
    }
    else {
      sAlert.success(i18n.__('clipboard.unableToCopy'))
    }
  } catch (err) {
    sAlert.success(i18n.__('clipboard.unableToCopy'))
    console.error('Fallback: Oops, unable to copy', err)
  }

  document.body.removeChild(textArea)
}

/**
 * Copies the given text to the clipboard
 * 
 * @param {String} text The content to be copied into the clipboard.
 */
function copyTextToClipboard(text) {
  // The browser might not have clipboard support
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text)
    return
  }

  navigator.clipboard.writeText(text).then(function() {
    sAlert.success(`${i18n.__('clipboard.textCopied')} ${text}`)
  }, (err) => {
    console.error(err)
    sAlert.success(i18n.__('clipboard.unableToCopy'))
  })
}

Template.clipboardBtnSmall.events({
  'click': (event, template) => {
    let str = template.data.text || ''
  
    if (template.data['prefix-text']) {
      str = `${template.data['prefix-text']}${str}`
    }

    if (template.data['selector-text']) {
      str += $(template.data['selector-text']).text()
    }

    if (template.data['subfix-val']) {
      str += $(template.data['subfix-val']).val()
    }
  
    if (template.data['subfix-text']) {
      str += template.data['subfix-text']
    }

    copyTextToClipboard(str)
  }
})