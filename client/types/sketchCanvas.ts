export enum CanvasTools {
    TEXT,
    DRAW,
}

export enum CanvasState {
    EDITING,
    SUBMITTING,
    SUBMITTED
}


export interface Line {
    color: string
    points: number[]
    lineWidth: number
}

export interface TextData {
    text: string,
    txtMult: number,
    pos: [number, number],
    color: string,
}


export enum CanvasActions {
    SET_COLOR,
    SET_LINEWIDTH,
    SET_TEXT_MULTIPLIER,
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
    textSizeMultiplier: number,
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
    type: CanvasActions.SET_TEXT_MULTIPLIER,
    textMult: number
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
