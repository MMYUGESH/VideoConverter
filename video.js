const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//to upload the selected file to dir
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
);

ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");

ffmpeg.setFfprobePath("C:/ffmpeg/bin");

ffmpeg.setFlvtoolPath("C:/flvtool");

console.log(ffmpeg);
//to connect with htmlpage
app.get("/", (req, res) => {

    res.sendFile(__dirname + "/index.html");
})

//action performed on clicking convertbutton
app.post("/convert", (req, res) => {

    let to = req.body.to;
    console.log(to);
    var file = req.files.file;
    console.log(file);
    let fileName = `output.${to}`;

    //file is moved into dir tmp
    file.mv("tmp/" + file.name, function (err) {
        if (err) {
            return res.sendStatus(500).send(err);
        }
        console.log("File Uploaded to Dir successfully");
    });
    ffmpeg("tmp/" + file.name)
        .withOutputFormat(to)
        .on("end", function (stdout, stderr) {
            console.log("Finished process");
            res.download(__dirname + fileName, function (err) {
                if (err) throw err;

                fs.unlink(__dirname + fileName, function (err) {
                    if (err) throw err;
                    console.log("File deleted");
                });
            });
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .on("error", function (err) {
            console.log("an error happened: " + err.message);
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .saveToFile(__dirname + fileName);
})

app.listen(3000, () => console.log("started"))