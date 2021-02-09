export enum CanvasTools {
    TEXT,
    DRAW,
}

export enum CanvasState {
    EDITING,
    SUBMITTING,
    SUBMITTED
}

export interface Point {
    x: number,
    y: number
}

export interface Line {
    color: string
    points: Point[]
    lineWidth: number
}

export interface TextData {
    text: string,
    fontSize: number,
    pos: Point,
    color: string,
}


export enum CanvasActions {
    SET_COLOR,
    SET_LINEWIDTH,
    SET_TOOL,
    SET_STATE,
    SET_SCALE,
    CLEAR_CANVAS,
    SET_CURRENTLINE,
    CURRENT_LINE_FINISHED,
    ADD_TEXT,
    CHANGE_TEXT,
    REMOVE_TEXT
}

export interface SketchState {
    color: string,
    lineWidth: number,
    currentTool: CanvasTools,
    canvasState: CanvasState,
    scale: number,
    currentLine: Line | null,
    lines: Line[],
    texts: TextData[],
    empty: boolean
}
export type ReducerActions = {
    type: CanvasActions.SET_COLOR,
    color: string
} | {
    type: CanvasActions.SET_LINEWIDTH,
    lineWidth: number
} | {
    type: CanvasActions.SET_TOOL,
    tool: CanvasTools
} | {
    type: CanvasActions.SET_STATE,
    state: CanvasState
} | {
    type: CanvasActions.SET_SCALE,
    scale: number
} | {
    type: CanvasActions.CLEAR_CANVAS,
} | {
    type: CanvasActions.SET_CURRENTLINE,
    line: Line
} | {
    type: CanvasActions.CURRENT_LINE_FINISHED,
} | {
    type: CanvasActions.ADD_TEXT,
    text: TextData
} | {
    type: CanvasActions.CHANGE_TEXT,
    index: number,
    newTextData: TextData
} | {
    type: CanvasActions.REMOVE_TEXT,
    index: number
};
