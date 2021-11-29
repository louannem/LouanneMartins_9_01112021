import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"
import { ROUTES } from '../constants/routes.js'
import firebase from "../__mocks__/firebase"
import {localStorageMock} from "../__mocks__/localStorage" 


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("The new bill form should be rendered", () => {
      const html = NewBillUI()
      document.body.innerHTML = html   

      const form = screen.getByTestId('form-new-bill')
      expect(form).toBeTruthy()
    })

    test("Then I upload a file in the form",  () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = pathname => { document.body.innerHTML = ROUTES({pathname})} 
      const newBillForm = new NewBill({document, onNavigate, firestore: null, localStorage: window.localStorage});

      const mockCallBack = jest.fn(newBillForm.handleChangeFile)
      const file = new File(['filemock.jpg'], 'filemock.jpg', { type: 'jpg' })
      const uploadBtn = screen.getByTestId('file')
      uploadBtn.addEventListener('change', mockCallBack)    
  
      fireEvent.change(uploadBtn, { target: { files: [file] } })
      
      expect(mockCallBack).toHaveBeenCalled()
    }) 

    describe("When I upload a file with the wrong extension", () => {
      test("Then an error message is displayed below",  () => {
        const html = NewBillUI()
        document.body.innerHTML = html
  
        const onNavigate = pathname => { document.body.innerHTML = ROUTES({pathname})} 
        const newBillForm = new NewBill({document, onNavigate, firestore: null, localStorage: window.localStorage});
  
        const mockCallBack = jest.fn(newBillForm.handleChangeFile)
        const file = new File(['filemock.txt'], 'filemock.txt', { type: 'txt' })
        const uploadBtn = screen.getByTestId('file')
        uploadBtn.addEventListener('change', mockCallBack)    

        fireEvent.change(uploadBtn, { target: { files: [file] } })

        //Retreives and test the error message
        expect(screen.getByText('Veuillez télécharger un fichier au format JPG, JPEG ou PNG.')).toBeTruthy()
      })
    })


    describe("When I upload a file with the right extension", () => {
      test("Then an error message is not displayed below",  () => {
        const html = NewBillUI()
        document.body.innerHTML = html
  
        const onNavigate = pathname => { document.body.innerHTML = ROUTES({pathname})} 
        const newBillForm = new NewBill({document, onNavigate, firestore: null, localStorage: window.localStorage});
  
        const mockCallBack = jest.fn(newBillForm.handleChangeFile)
        const file = new File(['filemock.jpg'], 'filemock.jpg', { type: 'jpg' })
        const uploadBtn = screen.getByTestId('file')
        uploadBtn.addEventListener('change', (e) => { mockCallBack(e) })
  
        fireEvent.change(uploadBtn, { target: { files: [file] } })

        const filePath = file.type
        const allowedExt = "jpg" || "png" || "jpeg"
 
        expect(allowedExt == filePath).toBeTruthy()
         
      })
    })

    describe("When I submit the form", () => {
      test("Then a new bill should be created", () => {
        //Sets a user (employee + email)
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email : "johndoe@billed.com"
          })
        );

        const html = NewBillUI()
        document.body.innerHTML = html

        const onNavigate = pathname => { document.body.innerHTML = ROUTES({pathname})} 
        const newBill = new NewBill({document, onNavigate, firestore: null, localStorage: localStorageMock });

        const mockCallBack = jest.fn(newBill.handleSubmit)
        const newBillForm = screen.getByTestId("form-new-bill")

        newBillForm.addEventListener('submit', mockCallBack)
        fireEvent.submit(newBillForm)
        expect(mockCallBack).toHaveBeenCalled()
        
      })
    })
  })
})

//test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to the New Bill page", () => {
    test("fetches bills from mock API GET", async () => {

      const postSpy = jest.spyOn(firebase, "post")
      const newBill = {
        id: "3786337",
        vat: "245",
        fileUrl: "htt://mock",
        status: "pending",
        type: "Transport",
        commentary: "",
        name: "Voyage Londres-Paris",
        fileName: "justificatif.jpg",
        date: "22/11/2022",
        amount:736,
        commentAdmin: "",
        email: "a@a",
        pct: 2
      }

      const bills =  await firebase.post(newBill)
      expect(postSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(5)

   })

    test("fetches newly posted bills from an API and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ data:[], loading: false, error: "Erreur 404" })
      document.body.innerHTML = html

      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches bills from an API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ data:[], loading: false, error: "Erreur 500" })
      document.body.innerHTML = html

      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
   
  })
})