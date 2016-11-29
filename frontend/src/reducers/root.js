import { combineReducers } from 'redux';

import { MemberInfoReducer, MemberListReducer } from './member';
import { JobInfoReducer, JobListReducer, ReadOnlyReducer } from './job';
import { AllocInfoReducer, AllocListReducer } from './allocation';
import { EvalInfoReducer, EvalListReducer } from './evaluation';
import { NodeInfoReducer, NodeListReducer } from './node';
import { DirectoryReducer, FileReducer } from './filesystem';

const rootReducer = combineReducers({
    member: MemberInfoReducer,
    members: MemberListReducer,
    job: JobInfoReducer,
    jobs: JobListReducer,
    readonly: ReadOnlyReducer,
    node: NodeInfoReducer,
    nodes: NodeListReducer,
    allocation: AllocInfoReducer,
    allocations: AllocListReducer,
    evaluation: EvalInfoReducer,
    evaluations: EvalListReducer,
    directory: DirectoryReducer,
    file: FileReducer,
});

export default rootReducer;
