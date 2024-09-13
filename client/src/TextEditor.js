import html2pdf from "html2pdf.js"
import { Document, Packer, Paragraph, TextRun } from "docx"
import { useCallback, useEffect, useState } from "react"
import Quill from "quill"
import "quill/dist/quill.snow.css"
import { io } from "socket.io-client"
import { useParams } from "react-router-dom"

const SAVE_INTERVAL_MS = 2000

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
]

export default function TextEditor() {
  const { id: documentId } = useParams()
  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState()

  useEffect(() => {
    const s = io("http://localhost:3001")
    setSocket(s)

    return () => {
      s.disconnect()
    }
  }, [])

  useEffect(() => {
    if (socket == null || quill == null) return

    socket.once("load-document", document => {
      quill.setContents(document)
      quill.enable()
    })

    socket.emit("get-document", documentId)
  }, [socket, quill, documentId])

  useEffect(() => {
    if (socket == null || quill == null) return

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents())
    }, SAVE_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }
  }, [socket, quill])

  const downloadPDF = () => {
    const editorContent = document.querySelector(".ql-editor")
    const opt = {
      margin: 1,
      filename: "document.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    }
    html2pdf().from(editorContent).set(opt).save()
  }

  const downloadDOCX = () => {
    const editorContent = quill.getText()
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [new Paragraph({ children: [new TextRun(editorContent)] })],
        },
      ],
    })

    Packer.toBlob(doc).then(blob => {
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = "document.docx"
      link.click()
    })
  }

  useEffect(() => {
    if (quill == null) return

    const toolbar = quill.getModule("toolbar")
    const toolbarContainer = toolbar.container

    // Create and append the custom PDF button
    const pdfButton = document.createElement("button")
    pdfButton.innerHTML = "PDF"
    pdfButton.onclick = downloadPDF
    pdfButton.style.margin = "0 4px" // Ensure spacing
    toolbarContainer.appendChild(pdfButton)

    // Create and append the custom DOCX button
    const docxButton = document.createElement("button")
    docxButton.innerHTML = "DOCX"
    docxButton.onclick = downloadDOCX
    docxButton.style.margin = "0 4px" // Ensure spacing
    toolbarContainer.appendChild(docxButton)
  }, [quill])

  const wrapperRef = useCallback(wrapper => {
    if (wrapper == null) return

    wrapper.innerHTML = ""
    const editor = document.createElement("div")
    wrapper.append(editor)
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    })
    q.disable()
    q.setText("Loading...")
    setQuill(q)
  }, [])

  return <div className="container" ref={wrapperRef}></div>
}
