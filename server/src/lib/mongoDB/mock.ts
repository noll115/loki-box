import { boxModel, BoxClass } from "./box";
import { userModel, UserClass } from "./user";
import { messageModel } from "./message";
import { DocumentType } from "@typegoose/typegoose";
export async function CreateMockData() {
    if (await userModel.findOne({ email: "test@test.com" }))
        return;

    let box1 = await boxModel.create({
        secretToken: "testBox1"
    });
    let box2 = await boxModel.create({
        secretToken: "testBox2"
    });
    let box3 = await boxModel.create({
        secretToken: "testBox3"
    })
    let user = await userModel.create({
        email: "test@test.com",
        password: "test",
        boxes: [{
            boxID: box1.id,
            boxName: "testBox1",
            seenAs: "testUser"
        }, {
            boxID: box2.id,
            boxName: "testBox2",
            seenAs: "testUser"
        }, {
            boxID: box3.id,
            boxName: "testBox3",
            seenAs: "test"
        }]
    });
    createMessages(box1, user);
    createMessages(box2, user);



    console.debug("CREATED MOCK DATA");

}


async function createMessages(box: DocumentType<BoxClass>, user: DocumentType<UserClass>) {
    let messages = [];
    messages.push(messageModel.create({
        data: {
            lines: [],
            texts: [{
                pos: [26, 15],
                txtSize: 18,
                color: "#FFFFFF",
                text: "Hi"
            }]
        },
        from: user._id,
        to: box._id,
        fromSeenAs: "test"
    }));
    messages.push(messageModel.create({
        data: {
            lines: [{
                points: [65, 56, 64, 75, 64, 75, 64, 96, 64, 116, 66, 136, 67, 152, 69, 166, 74, 179],
                color: "#FFFFFF",
                lineWidth: 6
            }, {
                points: [193, 53, 191, 74, 191, 74, 191, 90, 192, 106, 197, 123, 201, 139, 205, 151, 207, 156, 209, 160, 209, 164, 211, 167],
                color: "#FFFFFF",
                lineWidth: 6
            }, {
                points: [59, 113, 70, 112, 70, 112, 87, 109, 107, 105, 126, 101, 149, 99, 167, 97, 181, 96, 190, 96, 197, 96, 202, 96, 205, 97, 209, 98, 211, 98],
                color: "#FFFFFF",
                lineWidth: 6
            }],
            texts: []
        },
        from: user._id,
        to: box._id,
        fromSeenAs: "test"
    }));
    messages.push(messageModel.create({
        data: {
            lines: [],
            texts: [{
                pos: [0, 188],
                txtSize: 50,
                color: "#FFFFFF",
                text: "Hi"
            }, {
                pos: [46.21124839782715, 220],
                txtSize: 18,
                color: "#FFFFFF",
                text: "Hi"
            }]
        },
        from: user._id,
        to: box._id,
        fromSeenAs: "test"
    }));
    messages.push(messageModel.create({
        data: {
            lines: [{
                points: [165, 158, 152, 164, 152, 164, 133, 173, 122, 176, 110, 178, 101, 178, 95, 174, 91, 168, 91, 156, 95, 140, 102, 125, 111, 112, 122, 102, 133, 95, 145, 91, 154, 90, 161, 89, 165, 90, 167, 92, 169, 95, 171, 102, 175, 115, 179, 128, 186, 140, 197, 145, 210, 146, 225, 143, 242, 135, 258, 128, 267, 124, 260, 123],
                color: "#FFFFFF",
                lineWidth: 6
            }],
            texts: []
        },
        from: user._id,
        to: box._id,
        fromSeenAs: "test"
    }));
    messages.push(messageModel.create({
        data: {
            lines: [{
                points: [165, 158, 152, 164, 152, 164, 133, 173, 122, 176, 110, 178, 101, 178, 95, 174, 91, 168, 91, 156, 95, 140, 102, 125, 111, 112, 122, 102, 133, 95, 145, 91, 154, 90, 161, 89, 165, 90, 167, 92, 169, 95, 171, 102, 175, 115, 179, 128, 186, 140, 197, 145, 210, 146, 225, 143, 242, 135, 258, 128, 267, 124, 260, 123],
                color: "#FFFFFF",
                lineWidth: 6
            }],
            texts: []
        },
        from: user._id,
        to: box._id,
        fromSeenAs: "test"
    }));

    messages.push(messageModel.create({
        data: {
            lines: [{
                points: [165, 158, 152, 164, 152, 164, 133, 173, 122, 176, 110, 178, 101, 178, 95, 174, 91, 168, 91, 156, 95, 140, 102, 125, 111, 112, 122, 102, 133, 95, 145, 91, 154, 90, 161, 89, 165, 90, 167, 92, 169, 95, 171, 102, 175, 115, 179, 128, 186, 140, 197, 145, 210, 146, 225, 143, 242, 135, 258, 128, 267, 124, 260, 123],
                color: "#FFFFFF",
                lineWidth: 6
            }],
            texts: []
        },
        from: user._id,
        to: box._id,
        fromSeenAs: "test"
    }));
    messages.push(messageModel.create({
        data: {
            lines: [{
                points: [165, 158, 152, 164, 152, 164, 133, 173, 122, 176, 110, 178, 101, 178, 95, 174, 91, 168, 91, 156, 95, 140, 102, 125, 111, 112, 122, 102, 133, 95, 145, 91, 154, 90, 161, 89, 165, 90, 167, 92, 169, 95, 171, 102, 175, 115, 179, 128, 186, 140, 197, 145, 210, 146, 225, 143, 242, 135, 258, 128, 267, 124, 260, 123],
                color: "#FFFFFF",
                lineWidth: 6
            }],
            texts: []
        },
        from: user._id,
        to: box._id,
        fromSeenAs: "test"
    }));
    messages.push(messageModel.create({
        data: {
            lines: [{
                points: [165, 158, 152, 164, 152, 164, 133, 173, 122, 176, 110, 178, 101, 178, 95, 174, 91, 168, 91, 156, 95, 140, 102, 125, 111, 112, 122, 102, 133, 95, 145, 91, 154, 90, 161, 89, 165, 90, 167, 92, 169, 95, 171, 102, 175, 115, 179, 128, 186, 140, 197, 145, 210, 146, 225, 143, 242, 135, 258, 128, 267, 124, 260, 123],
                color: "#FFFFFF",
                lineWidth: 6
            }],
            texts: []
        },
        from: user._id,
        to: box._id,
        fromSeenAs: "test"
    }));
    messages.push(messageModel.create({
        data: {
            lines: [{
                points: [165, 158, 152, 164, 152, 164, 133, 173, 122, 176, 110, 178, 101, 178, 95, 174, 91, 168, 91, 156, 95, 140, 102, 125, 111, 112, 122, 102, 133, 95, 145, 91, 154, 90, 161, 89, 165, 90, 167, 92, 169, 95, 171, 102, 175, 115, 179, 128, 186, 140, 197, 145, 210, 146, 225, 143, 242, 135, 258, 128, 267, 124, 260, 123],
                color: "#FFFFFF",
                lineWidth: 6
            }],
            texts: []
        },
        from: user._id,
        to: box._id,
        fromSeenAs: "test"
    }));
    messages.push(messageModel.create({
        data: {
            lines: [{
                points: [165, 158, 152, 164, 152, 164, 133, 173, 122, 176, 110, 178, 101, 178, 95, 174, 91, 168, 91, 156, 95, 140, 102, 125, 111, 112, 122, 102, 133, 95, 145, 91, 154, 90, 161, 89, 165, 90, 167, 92, 169, 95, 171, 102, 175, 115, 179, 128, 186, 140, 197, 145, 210, 146, 225, 143, 242, 135, 258, 128, 267, 124, 260, 123],
                color: "#FFFFFF",
                lineWidth: 6
            }],
            texts: []
        },
        from: user._id,
        to: box._id,
        fromSeenAs: "test"
    }));
    await Promise.all(messages);
    console.debug(`CREATED MOCK MESSAGES FOR ${box.secretToken}`)
}