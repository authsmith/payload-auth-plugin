import { Field, TabAsField } from "payload"
import { fieldAffectsData, tabHasName } from "payload/shared"

type TraverseFieldsArgs = {
  data: Record<string, unknown>
  fields: (Field | TabAsField)[]
  result: Record<string, unknown>
}

export const traverseFields = ({
  data,
  // parent,
  fields,
  result,
}: TraverseFieldsArgs) => {
  fields.forEach((field) => {
    switch (field.type) {
      case 'collapsible':
      case 'row': {
        traverseFields({
          data,
          fields: field.fields,
          result,
        })
        break
      }
      case 'group': {
        if (fieldAffectsData(field)) {
          const groupData: Record<string, unknown> =
            (data[field.name] as Record<string, unknown>) ?? {}
          let targetResult
          if (typeof field.saveToJWT === 'string') {
            targetResult = field.saveToJWT
            result[field.saveToJWT] = groupData
          } else if (field.saveToJWT) {
            targetResult = field.name
            result[field.name] = groupData
          }
          const groupResult = (targetResult ? result[targetResult] : result) as Record<
            string,
            unknown
          >
          traverseFields({
            data: groupData,
            fields: field.fields,
            result: groupResult,
          })
          break
        } else {
          traverseFields({
            data,
            fields: field.fields,
            result,
          })

          break
        }
      }
      case 'tab': {
        if (tabHasName(field)) {
          const tabData: Record<string, unknown> =
            (data[field.name] as Record<string, unknown>) ?? {}
          let targetResult
          if (typeof field.saveToJWT === 'string') {
            targetResult = field.saveToJWT
            result[field.saveToJWT] = tabData
          } else if (field.saveToJWT) {
            targetResult = field.name
            result[field.name] = tabData
          }
          const tabResult = (targetResult ? result[targetResult] : result) as Record<
            string,
            unknown
          >
          traverseFields({
            data: tabData,
            fields: field.fields,
            result: tabResult,
          })
        } else {
          traverseFields({
            data,
            fields: field.fields,
            result,
          })
        }
        break
      }
      case 'tabs': {
        traverseFields({
          data,
          fields: field.tabs.map((tab) => ({ ...tab, type: 'tab' })),
          result,
        })
        break
      }
      default:
        if (fieldAffectsData(field)) {
          if (field.saveToJWT) {
            if (typeof field.saveToJWT === 'string') {
              result[field.saveToJWT] = data[field.name]
              delete result[field.name]
            } else {
              result[field.name] = data[field.name] as Record<string, unknown>
            }
          } else if (field.saveToJWT === false) {
            delete result[field.name]
          }
        }
    }
  })
  return result
}
