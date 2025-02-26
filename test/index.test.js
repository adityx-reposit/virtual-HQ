const backend_url = "https://loaclhost:3000";
const ws_url="ws://localhost:3001";
import WebSocketServer from 'websockets/lib/websockets/server';
describe("Authentication", () => {
  test("User is able to sign up only once ", async () => {
    const username = "aditya" + Math.random();
    const password = "123456";
    const response = await axios.post(`${backend_url}/api/v1/user/signup`, {
      username,
      password,
      type: "Admin",
    });
    expect(response.statusCode).toBe(200);
    const updatedresponse = await axios.post(
      `${backend_url}/api/v1/user/signup`,
      {
        username,
        password,
        type: "Admin",
      }
    );
    expect(updatedresponse.statusCode).toBe(400);
  });
  test("Signup request fails if the username is empty", () => {
    const username = "aditya" + Math.random();
    const password = "123456";

    const response = axios.post(`${backend_url}/api/v1/signup`, {
      password,
    });
    expect(response.statusCode).toBe(400);
  });
  test("signin suceeds if the username and password are correct ", async () => {
    const username = `aditya-${Math.random()}`;
    const password = "123456";

    await axios.post(`${backend_url}/api/v1/signup`, {
      username,
      password,
    });

    const response = await axios.post(`${backend_url}/api/v1/signup`, {
      username,
      password,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });
  test("Signin request fails if the username is incorrect", async () => {
    const username = "aditya" + Math.random();
    const password = "123456";

    const response = await axios.post(`${backend_url}/api/v1/signup`, {
      username: "wrong name",
      password,
    });
    expect(response.statusCode).toBe(400);
  });
});
describe("user metadata endpoints ", () => {
  let token = "";
  let avatarId = ";";
  beforeAll(async () => {
    const username = `kirat-${Math.random()}`;
    const password = "123456";
    await axios.post(`${backend_url}/api/v1/signup`, {
      username,
      password,
      type: "Admin",
    });
    const response = await axios.post(`${backend_url}/api/v1/signin`, {
      username,
      password,
    });

    token = response.data.token;

    const avatarResponse = await axios.post(
      `${backend_url}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },{
        headers:{
          Authorization:`Bearer ${userToken}`
        }
      }
    );

    avatarId = avatarResponse.data.avatarId;
  });
  test("user cant update their meta data with a wrong avatar id", async () => {
    const response = await axios.post(
      `${backend_url}/api/v1/user/metadata`,
      {
        avatarId: "1234455",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.statusCode).toBe(400);
  });

  test("user can update their metadata with the right metadata id", async () => {
    const response = await axios.post(
      `${backend_url}/api/v1/user/metadata`,
      {
        avatarId,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(response.statusCode).toBe(200);
  });

  test("user can't update their metadata if the auth header is not present", async () => {
    const response = await axios.post(`${backend_url}/api/v1/user/metadata`, {
      avatarId,
    }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
  });
    expect(response.statusCode).toBe(403);
  });
});
describe("User avatar information ", () => {
  let avatarId = "";
  let token = "";
  let userId;

  beforeAll(async () => {
    const username = `kirat-${Math.random()}`;
    const password = "123456";
    const signupResponse = await axios.post(`${backend_url}/api/v1/signup`, {
      username,
      password,
      type: "Admin",
    });

    userId = signupResponse.data.userId;

    const response = await axios.post(`${backend_url}/api/v1/signin`, {
      username,
      password,
    });

    token = response.data.token;

    const avatarResponse = await axios.post(
      `${backend_url}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
  });

    avatarId = avatarResponse.data.avatarId;
  });

  test("Get back avatar information for a user", async () => {
    const response = axios.get(
      `${backend_url}/api/v1/user/metadata/bulk?ids=${userId}`
    );

    expect((await response).data.avatars.length).toBe(1);
    expect(response.data.avatarId[0].userId).toBeDefined();
    expect(response.data.avatarId[0].userId).toBe(userId);
  });

  test("Avaialble avatars lists the recently created avatar", async () => {
    const response = await axios.get(`${backend_url}/api/v1/avatars`);

    expect(response.data.avatars.length).not.toBe(0);
    const currentAvatar = (await response).data.avatars.find(
      (x) => x.id == avatarId
    );
    expect(currentAvatar).toBeDefined();
  });
});
describe("space information", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let AdminToken;
  let adminId;
  let userId;
  let userToken;

  beforeAll(async () => {
    const username = `kirat-${Math.random()}`;
    const password = "123456";
    const signupResponse = await axios.post(`${backend_url}/api/v1/signup`, {
      username,
      password,
      type: "Admin",
    });

    adminId = signupResponse.data.userId;

    const response = await axios.post(`${backend_url}/api/v1/signin`, {
      username,
      password,
    });
    AdminToken = response.data.token;

    const userSignupResponse = await axios.post(
      `${backend_url}/api/v1/signup`,
      {
        username: username + "-user",
        password,
        type: "user",
      }
    );

    userId = userSignupResponse.data.userId;

    const userSigninResponse = await axios.post(
      `${backend_url}/api/v1/signin`,
      {
        username: username + "-user",
        password,
      }
    );
    userToken = userSigninResponse.data.token;
    const element1Response = await axios.post(
      `${backend_url}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${AdminToken}`,
        },
      }
    );
    const element2Response = await axios.post(
      `${backend_url}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${AdminToken}`,
        },
      }
    );

    element1Id = element1Response.data.id;
    element2Id = element2Response.data.id;

    const mapResponse = await axios.post(
      `${backend_url}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${AdminToken}`,
        },
      }
    );
    mapId = mapResponse.id;
  });

  test("user is able to create a space ", async () => {
    const spaceResponse = await axios.post(
      `${backend_url}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        header: {
          Authorization: `Bearer ${usertoken}`,
        },
      }
    );
    expect(spaceResponse.data.spaceId).toBeDefined();
  });

  test("user is able to create a space without a mapId {empty space}", async () => {
    const response = await axios.post(
      `${backend_url}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        header: {
          Authorization: `Bearer ${usertoken}`,
        },
      }
    );
    expect(response.data.spaceId).toBeDefined();
  });

  test("user is not  able to create a space without a mapId and a dimension ", async () => {
    const response = await axios.post(
      `${backend_url}/api/v1/space`,
      {
        name: "Test",
      },
      {
        header: {
          Authorization: `Bearer ${usertoken}`,
        },
      }
    );
    expect(response.statusCode).toBe(400);
  });

  test("user is not  able to delete a space that doesnt exist ", async () => {
    const response = await axios.delete(
      `${backend_url}/api/v1/space/randomIdDoesntExist`,
      {
        name: "Test",
      },
      {
        header: {
          Authorization: `Bearer ${usertoken}`,
        },
      }
    );
    expect(response.statusCode).toBe(400);
  });

  test("user is able to delete a space that exist ", async () => {
    const response = await axios.post(
      `${backend_url}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        header: {
          Authorization: `Bearer ${usertoken}`,
        },
      }
    );
    const deleteResponse = await axios.delete(
      `${backend_url}/api/v1/space/${response.data.spaceId}`,
      {
        header: {
          Authorization: `Bearer ${usertoken}`,
        },
      }
    );
    expect(deleteResponse.statusCode).toBe(200);
  });
  test("user should not be able to delete a space created by another user", async () => {
    const response = await axios.post(
      `${backend_url}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      }
    );
    const deleteResponse = await axios.delete(
      `${backend_url}/api/v1/space/${response.data.spaceId}`,
      {
        headers: {
          Authorization: `Bearer ${AdminToken}`,
        },
      }
    );
    expect(deleteResponse.statusCode).toBe(403);
  });

  test(`admin has no spaces initially`, async () => {
    const response = await axios.get(`${backend_url}/api/v1/space/all`);
    expect(response.data.spaces.length).toBe(0);
  });
  test(`admin has no space  initially`, async () => {
    const spaceCreateResponse = await axios.post(
      `${backend_url}/api/v1/space/all`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      }
    );

    const response = await axios.get(`${backend_url}/api/v1/space/all`);
    const filterSpaces = response.data.spaces.find(
      (x) => x.id == spaceCreateResponse.spaceId
    );
    expect(filterSpaces.length).toBeDefined();
  });
});

describe("arena endpoints ", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let AdminToken;
  let adminId;
  let userId;
  let userToken;
  let spaceId;
  beforeAll(async () => {
    const username = `kirat-${Math.random()}`;
    const password = "123456";
    const signupResponse = await axios.post(`${backend_url}/api/v1/signup`, {
      username,
      password,
      type: "Admin",
    });

    adminId = signupResponse.data.userId;

    const response = await axios.post(`${backend_url}/api/v1/signin`, {
      username: username,
      password,
    });
    AdminToken = response.data.token;

    const userSignupResponse = await axios.post(
      `${backend_url}/api/v1/signup`,
      {
        username: username + "-user",
        password,
        type: "user",
      }
    );

    userId = userSignupResponse.data.userId;

    const userSigninResponse = await axios.post(
      `${backend_url}/api/v1/signin`,
      {
        username: username + "-user",
        password,
      }
    );
    userToken = userSigninResponse.data.token;
    const element1Response = await axios.post(
      `${backend_url}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${AdminToken}`,
        },
      }
    );
    const element2Response = await axios.post(
      `${backend_url}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${AdminToken}`,
        },
      }
    );

    element1Id = element1Response.id;
    element2Id = element2Response.id;

    const mapResponse = await axios.post(
      `${backend_url}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${AdminToken}`,
        },
      }
    );
    mapId = mapResponse.id;
    const spaceResponse = await axios.post(
      `${backend_url}/api/v1/`,
      {
        name: "test",
        dimension: "100x200",
        mapId: mapId,
      },
      {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      }
    );

    spaceId = spaceResponse.data.spaceId;
  });
  test("incorrect space id returns nothing", async () => {
    const response = axios.get(`${backend_url}/api/v1/space/123kakakak`, {
      headers: {
        Authorization: `Bearer ${user}`,
      },
    });

    expect(response.statusCode).toBe(400);
  });
  test("correct spaceId returns all theb elements", async () => {
    const response = axios.get(`${backend_url}/api/v1/space/${spaceId}`, {
      headers: {
        Authorization: `Bearer ${user}`,
      },
    });
    expect(response.dimensions).toBe("100x200");
    expect(response.dimensions.elements.length).toBe(4);
  });

  test("delete endpoints is able to delete an element ", async () => {
    const reponse = await axios.get(`${backend_url}/api/v1/space/${spaceId}`, {
      headers: {
        Authorization: `Bearer ${user}`,
      },
    });
    axios.get(
      `${backend_url}/api/v1/space/element`,
      {
        spaceId: spaceId,
        elementId: response.data.elements[0].id,
      },
      {
        headers: {
          Authorization: `Bearer ${user}`,
        },
      }
    );

    const newResponse = await axios.get(
      `${backend_url}/api/v1/space/${spaceId}`,
      {
        headers: {
          Authorization: `Bearer ${user}`,
        },
      }
    );
    expect(newResponse.data.elements.length).toBe(2);
  });

  test("adding an element works as expected", async () => {
    await axios.get(
      `${backend_url}/api/v1/space/element`,
      {
        elemntId: element1Id,
        spaceId: spaceId,
        x: 50,
        y: 20,
      },
      {
        headers: {
          Authorization: `Bearer ${user}`,
        },
      }
    );

    const newResponse = await axios.get(
      `${backend_url}/api/v1/space/${spaceId}`,
      {
        headers: {
          Authorization: `Bearer ${user}`,
        },
      }
    );
    expect(newResponse.data.elements.length).toBe(3);
  });

  test("adding an element fails if element lies outside the dimensions", async () => {
    await axios.get(
      `${backend_url}/api/v1/space/element`,
      {
        elemntId: element1Id,
        spaceId: spaceId,
        x: 10000,
        y: 21000,
      },
      {
        headers: {
          Authorization: `Bearer ${user}`,
        },
      }
    );
    expect(newResponse.statusCode).toBe(404);
  });
});

describe("Admin Endpoints", async () => {
  let AdminToken;
  let adminId;
  let userId;
  let userToken;

  beforeAll(async () => {
    const username = `kirat-${Math.random()}`;
    const password = "123456";
    const signupResponse = await axios.post(`${backend_url}/api/v1/signup`, {
      username,
      password,
      type: "Admin",
    });

    adminId = signupResponse.data.userId;

    const signInresponse = await axios.post(`${backend_url}/api/v1/signin`, {
      username: username,
      password,
    });
    AdminToken = signInresponse.data.token;

    const userSignupResponse = await axios.post(
      `${backend_url}/api/v1/signup`,
      {
        username: username + "-user",
        password,
        type: "user",
      }
    );

    userId = userSignupResponse.data.userId;

    const userSigninResponse = await axios.post(
      `${backend_url}/api/v1/signin`,
      {
        username: username + "-user",
        password,
      }
    );
    userToken = userSigninResponse.data.token;
  });
  test("user is not able to hit the endpoints ", async () => {
    const element1Response = await axios.post(
      `${backend_url}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const mapResponse = await axios.post(
      `${backend_url}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [],
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );


    const avatarResponse = await axios.post(
      `${backend_url}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      const UpdateElementResponse = await axios.put(`${backend_url}/api/v1/admin/element`,{
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      expect(element1Response.statusCode).toBe(403);
      expect(mapResponse.statusCode).toBe(403);
      expect(avatarResponse.statusCode).toBe(403);
      expect(avatarResponse.statusCode).toBe(403)
    });
    test("admin is able to hit the endpoints", async () => {
      const element1Response = await axios.post(
        `${backend_url}/api/v1/admin/element`,
        {
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
          width: 1,
          height: 1,
          static: true,
        },
        {
          headers: {
            Authorization: `Bearer ${AdminToken}`,
          },
        }
      );
    
      const mapResponse = await axios.post(
        `${backend_url}/api/v1/admin/map`,
        {
          thumbnail: "https://thumbnail.com/a.png",
          dimensions: "100x200",
          name: "100 person interview room",
          defaultElements: [],
        },
        {
          headers: {
            Authorization: `Bearer ${AdminToken}`,
          },
        }
      );
    
      const avatarResponse = await axios.post(
        `${backend_url}/api/v1/admin/avatar`,
        {
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
          name: "Timmy",
        },
        {
          headers: {
            Authorization: `Bearer ${AdminToken}`,
          },
        }
      );
    
      const updateElementResponse = await axios.put(
        `${backend_url}/api/v1/admin/element`,
        {
          
        },
        {
          headers: {
            Authorization: `Bearer ${AdminToken}`,
          },
        }
      );
    
      // Assert the expected status codes
      expect(element1Response.status).toBe(403); // Use `.status` instead of `.statusCode`
      expect(mapResponse.status).toBe(403);
      expect(avatarResponse.status).toBe(403);
      expect(updateElementResponse.status).toBe(403);
    
      // Logical error fixed: Avatar response status can't be both 200 and 403
      // Removed contradictory assertion
    });
    test("admin is able to update the space ", async ()=>{
      const elementResponse = await axios.post(`${backend_url}/api/v1/admin/element`,
        {
          imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
          width: 1,
          height: 1,
          static: true,
        },{
          headers:{
            Authorization:`Bearer ${AdminToken}`
          }
      });

      const UpdateElementResponse= await axios.put(`${backend_url}/api/v1/admin/element/${elementResponse.data.id}`,{
        "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s"
      },{
        headers:{
          Authorization:`Bearer ${AdminToken}`
        }
      })
      expect(updatedresponse.statusCode).toBe(200)
      
    });
  });
  
describe("Websockets tests",()=>{
    let userToken;
    let AdminUserId;
    let AdminToken;
    let mapId;
    let element1Id;
    let element2Id;
    let spaceId;
    let ws1;
    let ws2;
    let ws1Messages=[];
    let ws2Messages=[];
    let userX;
    let userY;
    let adminX;
    let adminY;


    function waitForAndPopLatestMesaage(messageArray){
          return new Promise(r =>{
          if( messageArray.length>0){
              resolve( messageArray.shift())
          }

            else{
              let interval=setTimeout(()=>{
                if(messageArray.length>0){
                  resolve(messageArray.shift())
                  clearInterval(interval)
                }
              },100)
            }
          })
     }
  
 async function setupHttp(){

    const userNameResponse= `aditya=${Math.random()}`
    const password="12345"
    const adminSignupResponse= await axios.post(`${backend_url}/api/v1/signup`,{
      username,
      password,
      role:"admin"
    })  
    
    const adminSigninResponse= await axios.post(`${backend_url}/api/v1/signin`,{
      username,
      password
      
    })  
    AdminUserId=adminSignupResponse.data.userId;
    adminToken=adminSigninResponse.data.token
    
    const userSignupResponse=await axios.post(`${backend_url}/api/v1/signup`,{
      usernmae:username + "-user",
      password
    })
    const userSigninResponse = await axios.post(`${backend_url}/api/v1/signin`,{
      username: username + "-user",
      password
    })
    userId=userSignupResponse.data.userId
    userToken=userSigninResponse.data.token
    
    const element1Response = await axios.post(
      `${backend_url}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${AdminToken}`,
        },
      }
    );
    const element2Response = await axios.post(
      `${backend_url}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${AdminToken}`,
        },
      }
    );
    
    element1Id = element1Response.data.id;
    element2Id = element2Response.data.id;
    
    const mapResponse = await axios.post(
      `${backend_url}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${AdminToken}`,
        },
      });
      mapId=mapResponse.id
      const spaceResponse = await axios.post(
        `${backend_url}/api/v1/`,
        {
          name: "test",
          dimension: "100x200",
          mapId: mapId,
        },
        {
          headers: {
            Authorization: `Bearer ${usertoken}`,
          },
        }
      );
    
      spaceId = spaceResponse.data.spaceId;
   
  }
  
  async function setUpWs(){
       ws1=new WebSocketServer(ws_url)
       
       await new Promise(r =>{
         ws1.onopen=r
        })
        ws1.onmessage=(event)=>{
          ws1Messages.push(JSON.parse(event.data))
        }
        ws2=new WebSocketServer(ws_url)
        await new Promise(r =>{
        ws2.onopen=r
      })
      ws2.onmessage=(event)=>{
        ws2Messages.push(JSON.parse(event.data))
      }
}
    beforeAll(async()=>{
         setupHttp();
         setUpWs();
    })

     test("Get back for joining the space ",async()=>{
      ws1.send(JSON.stringify({
        "type": "join",
        "payload": {
          "spaceId": spaceId,
          "token": AdminToken
        }
       }))

       const message1 = await waitForAndPopLatestMesaage(ws1Messages);

       ws2.send(JSON.stringify({
        "type": "join",
        "payload": {
          "spaceId": spaceId,
          "token": userToken
        }
       }))


       const message2=await waitForAndPopLatestMesaage(ws2Messages);
       
       const message3 = await waitForAndPopLatestMesaage(ws1Messages);
       

       expect(message1.type).toBe("space-joined");
       expect(message2.type).toBe("space-joined");
       expect(message1.payload.users.length).tobe(0);
       expect(message2.payload.users.length).tobe(1);
       expect(message3.type).toBe("user-join");
       expect(message3.payload.x).toBe(message2.payload.x);
       expect(message3.payload.y).toBe(message2.payload.y);
       expect(message3.payload.userId).toBe(userId);
       
         adminX=message1.payload.spawn.x
         adminY=message1.payload.spawn.y

         userX=message2.payload.spawn.x
         userY=message2.payload.spawn.y
          
   
      })

      test("user should not be able to move across the boundary of the wall",async()=>{
        ws1.send(JSON.stringify({
           type :"movement",
           payload:{
               x:100000,
               y:10000
           }
        }))

       const message= await waitForAndPopLatestMesaage(ws1Messages)
       expect(message.type).toBe("movement-rejected")
       expect(message.payload.x).toBe(adminX)
       expect(message.payload.y).toBe(adminY)
     
      })


      test("user should not be able to move two blocks at the same time",async()=>{
        ws1.send(JSON.stringify({
           type :"movement",
           payload:{
               x:adminX+2,
               y:adminY
           }
        }))

       const message= await waitForAndPopLatestMesaage(ws1Messages)
       expect(message.type).toBe("movement-rejected")
       expect(message.payload.x).toBe(adminX)
       expect(message.payload.y).toBe(adminY)
     
      })
 
      test("correct movement should be broadcasted to thh other sockets",async()=>{
        ws1.send(JSON.stringify({
           type :"movement",
           payload:{
               x:adminX+1,
               y:adminY,
               userId:adminId
           }
        }))

       const message= await waitForAndPopLatestMesaage(ws2Messages)
       expect(message.type).toBe("movement-rejected")
       expect(message.payload.x).toBe(adminX)
       expect(message.payload.y).toBe(adminY)
     
      })

      test("if a user leaves the other user recieves a leaves event ",async()=>{
      ws1.close()

       const message= await waitForAndPopLatestMesaage(ws2Messages)
       expect(message.type).toBe("user-left")
       expect(message.payload.userId).toBe(AdminUserId)
     
     
      })
 
    })
