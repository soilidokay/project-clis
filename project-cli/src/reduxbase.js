const fs = require("fs");
const path = require("path");

// Function to replace placeholders in file content
const replacePlaceholders = (content, moduleName) => {
  const regex = new RegExp("Example", "g");
  return content.replace(regex, moduleName);
};

// Define the files and their content
const files = {
  // forms.tsx
  "forms.tsx": `import React, { FC } from 'react'
import { Typography } from '@mui/material'
import { FormValidator, SingleRuleValidate, FormModalWrapper, CreateFormGridLayout, CreateFormComfirm } from '@lib/Forms'
import { IExampleDTO } from './types'

const FormGridLayoutInstance = CreateFormGridLayout<IExampleDTO>({
  configs: [{ key: 'Id', label: 'Id' }],
  validate: new FormValidator({
    Id: { Rules: [{ rule: SingleRuleValidate.Required }] }
  })
})

// ========= ========= ========= Form Create ========= ========= =========
interface IFormCreateProps {
  onSubmit: (value: Partial<IExampleDTO>) => Promise<void>
}

export const FormCreate: FC<IFormCreateProps> = (props) => (
  <FormModalWrapper title='Create' size='md'>
    <FormGridLayoutInstance onSubmit={props.onSubmit} />
  </FormModalWrapper>
)

// ========= ========= ========= Form Edit ========= ========= =========
interface IFormEditProps {
  data: IExampleDTO
  onSubmit: (value: Partial<IExampleDTO>) => Promise<void>
}

export const FormEdit: FC<IFormEditProps> = (props) => (
  <FormModalWrapper title='Edit' size='md'>
    <FormGridLayoutInstance data={props.data} onSubmit={props.onSubmit} />
  </FormModalWrapper>
)

// ========= ========= ========= Form Delete ========= ========= =========
export const FormDelete = CreateFormComfirm<IExampleDTO>({
  title: 'Are yout sure delete?',
  content: (x) => <Typography variant='subtitle2'>{x?.Id}</Typography>
})
`,
  // index.tsx
  "index.tsx": `import { FC } from 'react'
import { connect } from 'react-redux'
import { CreateHocLazy } from '@lib-lab/Redux'
import { IExampleReduxProps } from './redux.types'
import { mapDispatchToProps, mapStateToProps } from './redux.map'

interface IProps extends IExampleReduxProps {}

export const ViewBase: FC<IProps> = (props) => (
  <div>
    <h1>Module: Example</h1>
    <p>Source: project cli</p>
    <p>Terminal: pi reduxtable Example</p>
  </div>
)

export * from './redux.thunk'
export * from './redux.slice'

const HocLazyInstance = CreateHocLazy(ViewBase)
export const ExampleMapRedux = connect(mapStateToProps, mapDispatchToProps)(HocLazyInstance)
`,
  // redux.map.ts
  "redux.map.ts": `import { AppDispatch } from '@internal/redux'
import { ApiAlertContext } from '@lib/ApiContext'
import { ExampleSlice } from './redux.slice'
import { fetchExampleThunk } from './redux.thunk'
import { IReduxMapDispatch, IReduxMapState } from './redux.types'
import ExampleService from './service'

export const mapStateToProps = (state: RootState): IReduxMapState => ({
  slice: state.ExampleSlice,
  status: state.ExampleSlice.status
})

export const mapDispatchToProps = (dispatch: AppDispatch): IReduxMapDispatch => ({
  fetchData: () => {
    return dispatch(fetchExampleThunk())
  },
  onChangeStatus: (status) => {
    dispatch(ExampleSlice.actions.onChangeStatus(status))
  },
  CRUD: {
    Create: async (model) => {
      try {
        await ExampleService.Create(model)
        dispatch(fetchExampleThunk())
        ApiAlertContext.ApiAlert?.PushSuccess('Created successfully!')
      } catch (error) {
        console.log(error)
        ApiAlertContext.ApiAlert?.PushError('Create failed!')
      }
    },
    Update: async (Id, model) => {
      try {
        await ExampleService.Update(Id, model)
        dispatch(fetchExampleThunk())
        ApiAlertContext.ApiAlert?.PushSuccess('Updated successfully!')
      } catch (error) {
        console.log(error)
        ApiAlertContext.ApiAlert?.PushError('Update failed!')
      }
    },
    Delete: async (Id) => {
      try {
        const data = await ExampleService.Remove(Id)
        if (data) dispatch(fetchExampleThunk())
        ApiAlertContext.ApiAlert?.PushSuccess('Deleted successfully!')
      } catch (error) {
        console.log(error)
        ApiAlertContext.ApiAlert?.PushError('Delete failed!')
      }
    }
  }
})
`,
  // redux.slice.ts
  "redux.slice.ts": `import { ReduxBase } from '@lib-lab/Redux'
import { ELazyStatus } from '@lib/ReduxBase'
import { createSlice } from '@reduxjs/toolkit'
import { fetchExampleThunk } from './redux.thunk'
import { IExampleSliceState } from './redux.types'

export const DefaultSlice = ReduxBase.GetInitialSlice<IExampleSliceState>({ state: {} })

const initialState: IExampleSliceState = DefaultSlice.initialState

export const ExampleSlice = createSlice({
  name: 'ExampleSlice',
  // 'createSlice' will infer the state type from the 'initialState' argument
  initialState,
  reducers: { ...DefaultSlice.reducers },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExampleThunk.fulfilled, (state, action) => {
        if (state.requestedId !== action.meta.requestId) return
        state.status = ELazyStatus.Loaded
      })
      .addCase(fetchExampleThunk.rejected, (state, action) => {
        if (state.requestedId !== action.meta.requestId) return
        state.status = ELazyStatus.Error
      })
      .addCase(fetchExampleThunk.pending, (state, action) => {
        state.requestedId = action.meta.requestId
        state.status = ELazyStatus.Loading
      })
  }
})
`,
  // redux.thunk.ts
  "redux.thunk.ts": `import { createAsyncThunk } from '@reduxjs/toolkit'
import { IReduxThunkArg, IReduxThunkReturned } from './redux.types'

export const fetchExampleThunk = createAsyncThunk<IReduxThunkReturned, IReduxThunkArg | undefined>('fetchExampleThunk', async (param, thunkAPI) => {
  // const state = thunkAPI.getState() as RootState
  // call api here
  // data mapping to tableInfo
  // const filter = ExampleMapping.tableInfoToFilter(tableInfoParam)
  // const res = await ExampleService.All(filter, thunkAPI.signal)
  return {}
})
`,
  // redux.types.ts
  "redux.types.ts": `import { ICRUDReduxMapDispatch, ReduxBase } from '@lib-lab/Redux'
import { IExampleDTO } from './types'

export interface IExampleSliceState extends ReduxBase.ISliceState {}

export interface IReduxThunkArg {}

export interface IReduxThunkReturned {}

export interface IReduxMapState extends ReduxBase.IMapState {
  slice: IExampleSliceState
}

export interface IReduxMapDispatch extends ReduxBase.IMapDispatch {
  CRUD: ICRUDReduxMapDispatch<IExampleDTO, 'Id'>
}

export interface IExampleReduxProps extends IReduxMapState, IReduxMapDispatch {}
`,
  // service.ts
  "service.ts": `import { CRUDServiceBase } from '@lib/Http'
import { EntityTimeBase } from '@shared/Types'
import { ITableTemplateState } from '@lib/Table'
import { TableToRequestFilter } from '@lib/Helpers'

export interface IExample extends EntityTimeBase {
  Id: string
}

class ExampleServiceBase extends CRUDServiceBase<IExample, string> {
  constructor() {
    super('/api/v1/Example')
  }
}
const ExampleService = new ExampleServiceBase()
export default ExampleService

class ExampleMappingBase {
  tableInfoToFilter = (tableInfo: ITableTemplateState<IExample>) => {
    return new TableToRequestFilter.Swagger<IExample>({ acceptedFileds: ['Id', 'DateCreated', 'DateUpdated'] })
      .fromTable(tableInfo, [])
      .sort({ field: 'Id', sort: 'asc' })
      .build()
  }
}
export const ExampleMapping = new ExampleMappingBase()
`,
  // types.ts
  "types.ts": `import { IExample } from './service'

export interface IExampleDTO extends IExample {}
`,
};

// Prompt for the module name and create files
const promptModuleName = () => {
  const moduleName = process.argv[3]; // Pass module name as a command-line argument
  if (!moduleName) {
    console.error(
      'Please provide a module name, e.g., "pi reduxbase Example".'
    );
    process.exit(1);
  }

  const directory = `./${moduleName}`;
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  Object.entries(files).forEach(([fileName, content]) => {
    const filePath = path.join(directory, fileName);
    const updatedContent = replacePlaceholders(content, moduleName);
    fs.writeFileSync(filePath, updatedContent, "utf8");
    console.log(`Created: ${filePath}`);
  });
};

promptModuleName();
