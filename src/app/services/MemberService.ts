
import axios from "axios";
import { serverApi } from "../../lib/config";
import { LoginInput, Member, MemberInput, MemberUpdateInput } from "../../lib/types/member";

class MemberService {
    private readonly path: string;

    constructor() {
        this.path = serverApi;
    }
    
 public async getMemberById(memberId: string): Promise<Member> {
   try {
     const url = `${this.path}/member/${memberId}`;
     const result = await axios.get(url);
     return result.data;
   } catch(err) {
      console.log("Error, getMemberById:", err);
      throw err;
   }
 }

 public async getTopUsers(): Promise<Member[]> {
   try {
     const url = this.path + "/member/top-users";
     const result = await axios.get(url);


  return result.data;

   } catch(err) {
      console.log("Error, getTopUsers:", err);
      throw err;
   }
 }

 
 public async getLibrary(): Promise<Member> {
   try {
     const url = this.path + "/member/library";
     const result = await axios.get(url);
     return result.data;
   } catch(err) {
      console.log("Error, getLibrary:", err);
      throw err;
   }
 }

 public async signup(input: MemberInput): Promise<Member> {
  try {
    const url = this.path + "/member/signup";
   const result = await axios.post(url, input, {withCredentials: true});

   const member: Member = result.data.member;
   localStorage.setItem("memberData", JSON.stringify(member));

   return member;
  } catch(err) {
       console.log("Error, signup:", err);
       throw err;
  }
 }

 public async login(input: LoginInput): Promise<Member> {
  try {
    const url = this.path + "/member/login";
   const result = await axios.post(url, input, {withCredentials: true});

   const member: Member = result.data.member;
   localStorage.setItem("memberData", JSON.stringify(member));

     return member;
  }  catch(err) {
      console.log("Error, login:", err);
      throw err;
  }
 }

 public async logout(): Promise<void> {
  try {
    const url = this.path + "/member/logout";
    await axios.post(url, {}, {withCredentials: true});
  } catch(err) {
    // Server-side failure must not keep the user stuck as logged in
    console.log("Error, logout:", err);
  } finally {
    localStorage.removeItem("memberData");
  }
 }

 public async updateMember(input: MemberUpdateInput): Promise<Member> {
  try {
     const formData = new FormData();
     formData.append("memberNick", input.memberNick || "");
     formData.append("memberPhone", input.memberPhone || "");
     // Only send optional fields when present so they are not wiped
     if (input.memberAddress !== undefined) formData.append("memberAddress", input.memberAddress);
     if (input.memberDesc !== undefined) formData.append("memberDesc", input.memberDesc);
     if (input.memberImage instanceof File) {
       formData.append("memberImage", input.memberImage);
     }
   
     const result = await axios(`${serverApi}/member/update`, {
       method: "POST",
       data: formData,
       withCredentials: true,
       headers: {
        "Content-Type": "multipart/form-data",
       },
     });


     const member: Member = result.data;
     localStorage.setItem("memberData", JSON.stringify(member));
     return member;
  }  catch(err) {
      console.log("Error, updateMember:", err);
      throw err;
  }
 }

};


export default MemberService;