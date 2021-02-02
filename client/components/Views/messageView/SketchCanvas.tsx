import { Dimensions, GestureResponderEvent } from "react-native";
import Canvas, { CanvasRenderingContext2D } from "react-native-canvas";

interface Point {
    x: number,
    y: number
}

class Line {
    color: string
    points: Point[]
    lineWidth: number
    constructor(color: string, lineWidth: number) {
        this.points = []
        this.color = color
        this.lineWidth = lineWidth;
    }

    changeLineWidth(lineWidth: number) {
        this.lineWidth = lineWidth;
    }

    changeColor(color: string) {
        this.color = color;
    }


    redraw(ctx: CanvasRenderingContext2D) {
        this.drawStart(ctx);
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            const point = this.points[i];
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    drawStart(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
    }


    draw(mousePoint: Point, ctx: CanvasRenderingContext2D) {
        this.points.push(mousePoint);
        ctx.lineTo(mousePoint.x, mousePoint.y);
    }

}

export class SketchCanvas {
    lines: Line[]
    currentLine!: Line
    selectedColor: string
    ctx: CanvasRenderingContext2D
    lineWidth: number
    constructor(private canvas: Canvas) {
        this.selectedColor = 'white'
        this.lines = [];
        this.ctx = canvas.getContext('2d');
        this.lineWidth = 12;
        canvas.width = 320;
        canvas.height = 240;
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.lineCap = 'round'
        this.ctx.lineWidth = this.lineWidth;
    }

    changeColor(newCol: string) {
        this.selectedColor = newCol;
        this.currentLine.changeColor(newCol);
    }

    startDraw(beginPoint: Point) {
        this.ctx.beginPath();
        this.ctx.moveTo(beginPoint.x, beginPoint.y);
        this.currentLine = new Line(this.selectedColor, this.lineWidth);
        this.currentLine.drawStart(this.ctx);
    }

    draw(mousePoint: Point) {
        this.currentLine.draw(mousePoint, this.ctx);
        this.ctx.stroke();
    }

    endDraw() {
        this.lines.push(this.currentLine);
        this.ctx.stroke();
    }

    undo() {
        this.lines.pop();
        this.clearCanvas();
        for (const line of this.lines) {
            line.redraw(this.ctx);
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        new Path2D();
        
    }


    reset() {
        this.lines = [];
        this.clearCanvas();
    }

    scaleView() {
        let { height, width } = Dimensions.get('window');
        console.log(height, width);
    }

    addText(texts: JSX.Element[]) {

    }



}