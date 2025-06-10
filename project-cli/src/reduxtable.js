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
  "index.tsx": `import React, { FC } from 'react'
import { connect } from 'react-redux'
import { TableFormater } from '@lib/Helpers'
import { CreateHocLazy } from '@lib-lab/Redux'
import { ActionPannel, CreateTableTemplate, CRUDPannel, MapOprators } from '@lib/Table'
import { IExampleReduxProps } from './redux.types'
import { mapDispatchToProps, mapStateToProps } from './redux.map'
import { IExampleDTO } from './types'
import { FormCreate, FormDelete, FormEdit } from './forms'

const TableInstance = CreateTableTemplate<IExampleDTO>('Redux', {
  getRowId: (x) => x.Id,
  config: {
    Id: { type: 'string', flex: 1 },
    DateCreated: {
      type: 'string',
      headerName: 'Date created',
      minWidth: 190,
      filterable: false,
      renderCell: (params) => TableFormater.tooltipDate(params.value)
    }
  },
  filterOperators: MapOprators //server mode
})

interface IProps extends IExampleReduxProps {}

export const ViewBase: FC<IProps> = (props) => (
  <TableInstance
    ReduxOption={props.tableInfo}
    onChange={props.onChangeTableInfo}
    CRUDPannel={() => <CRUDPannel Title='Example' Create={<FormCreate onSubmit={props.CRUD.Create} />} />}
    ActionPannel={(p) => {
      const data = p.data as IExampleDTO
      return (
        <ActionPannel
          Edit={<FormEdit data={data} onSubmit={async (x) => await props.CRUD.Update(data.Id, x)} />}
          Delete={<FormDelete data={data} onSubmit={async (x) => await props.CRUD.Delete(data.Id, x)} />}
        />
      )
    }}
  />
)

export * from './redux.thunk'
export * from './redux.slice'

const HocLazyInstance = CreateHocLazy(ViewBase)
export const ExampleMapRedux = connect(mapStateToProps, mapDispatchToProps)(HocLazyInstance)
`,
  // redux.map.ts
  "redux.map.ts": `import { AppDispatch } from '@internal/redux'
import { ReduxBaseTable } from '@lib-lab/Redux'
import { ApiAlertContext } from '@lib/ApiContext'
import { IExampleDTO } from './types'
import { fetchExampleThunk } from './redux.thunk'
import { ExampleSlice, DefaultSlice } from './redux.slice'
import { IReduxMapDispatch, IReduxMapState } from './redux.types'
import ExampleService from './service.example'

export const mapStateToProps = (state: RootState): IReduxMapState => ({
  slice: state.ExampleSlice,
  tableInfo: state.ExampleSlice.tableInfo,
  status: state.ExampleSlice.status
})

type TRequest = { abort: () => void }
const FetchAccessory: { request?: TRequest } = {}
export const mapDispatchToProps = (dispatch: AppDispatch): IReduxMapDispatch => ({
  fetchData: () => {
    const tableInfoQueryParam = ReduxBaseTable.getParam<IExampleDTO>(DefaultSlice.initialState.tableInfo)
    return dispatch(fetchExampleThunk({ tableInfoQueryParam }))
  },
  onChangeStatus: (status) => {
    dispatch(ExampleSlice.actions.onChangeStatus(status))
  },
  onChangeTableInfo: (key, value, details) => {
    if (key === 'FilterModel') {
      dispatch(ExampleSlice.actions.onChangeTableInfo({ key, value, details }))
    }
    FetchAccessory.request?.abort()
    FetchAccessory.request = dispatch(fetchExampleThunk({ tableInfoChange: { key, value: value, details } }))
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
  "redux.slice.ts": `import { ELazyStatus } from '@lib/ReduxBase'
import { createSlice } from '@reduxjs/toolkit'
import { ReduxBaseTable } from '@lib-lab/Redux'
import { IExampleDTO } from './types'
import { fetchExampleThunk } from './redux.thunk'
import { IExampleSliceState } from './redux.types'

export const DefaultSlice = ReduxBaseTable.GetInitialSlice<IExampleSliceState, IExampleDTO>({
  GridSortModel: [{ field: 'DateCreated', sort: 'desc' }]
})

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
        state.tableInfo = action.payload.tableInfo
      })
      .addCase(fetchExampleThunk.rejected, (state, action) => {
        if (state.requestedId !== action.meta.requestId) return
        state.status = ELazyStatus.Error
        state.tableInfo.isLoading = false
      })
      .addCase(fetchExampleThunk.pending, (state, action) => {
        state.requestedId = action.meta.requestId
        state.status = ELazyStatus.Loading
        state.tableInfo.isLoading = true
      })
  }
})
`,
  // redux.thunk.ts
  "redux.thunk.ts": `import { createAsyncThunk } from '@reduxjs/toolkit'
import { IReduxThunkArg, IReduxThunkReturned } from './redux.types'

export const fetchExampleThunk = createAsyncThunk<IReduxThunkReturned, IReduxThunkArg | undefined>('fetchExampleThunk', async (param, thunkAPI) => {
  // const state = thunkAPI.getState() as RootState
  // const tableInfoParam = ReduxBaseTable.ThunkArgMapping({ tableInfo: state.ExampleSlice.tableInfo, ...param })

  // call api here
  // data mapping to tableInfo
  // const filter = ExampleMapping.tableInfoToFilter(tableInfoParam)
  // const res = await ExampleService.All(filter, thunkAPI.signal)
  // const tableInfo = ReduxBaseTable.ThunkReponseMapping(tableInfoParam, {Data: res?.Data, Total: res?.Total})

  // const tableInfo = ReduxBaseTable.ThunkReponseMapping(tableInfoParam, {})
  // ReduxBaseTable.setParam<IExampleDTO>(tableInfo, DefaultSlice.initialState.tableInfo)
  // return { tableInfo }

  return { tableInfo: { isLoading: false, PageInfo: { data: [], page: 1, pageSize: 25 } } }
})
`,
  // redux.types.ts
  "redux.types.ts": `import { ICRUDReduxMapDispatch, ReduxBaseTable } from '@lib-lab/Redux'
import { IExampleDTO } from './types'

export interface IExampleSliceState extends ReduxBaseTable.ISliceState<IExampleDTO> {}

export interface IReduxThunkArg extends ReduxBaseTable.IThunkArg<IExampleDTO> {}

export interface IReduxThunkReturned extends ReduxBaseTable.IThunkReturned<IExampleDTO> {}

export interface IReduxMapState extends ReduxBaseTable.IMapState<IExampleDTO> {
  slice: IExampleSliceState
}

export interface IReduxMapDispatch extends ReduxBaseTable.IMapDispatch<IExampleDTO> {
  CRUD: ICRUDReduxMapDispatch<IExampleDTO, 'Id'>
}

export interface IExampleReduxProps extends IReduxMapState, IReduxMapDispatch {}
`,
  // service.ts
  "service.ts": `import { CRUDServiceBase } from '@lib/Http'
import { EntityTimeBase } from '@shared/Types'

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

class ExampleMappingBase {}
export const ExampleMapping = new ExampleMappingBase()
`,
  // types.ts
  "types.ts": `import { IExample } from './service.example'

export interface IExampleDTO extends IExample {}
`,
};

// Prompt for the module name and create files
const promptModuleName = () => {
  const moduleName = process.argv[3]; // Pass module name as a command-line argument
  if (!moduleName) {
    console.error(
      'Please provide a module name, e.g., "pi tableredux Example".'
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
