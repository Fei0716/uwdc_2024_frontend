import {defineStore} from 'pinia';
import {reactive,watch} from 'vue';

const useAuthStore = defineStore('auth' , ()=>{
  /*state*/
  const user = reactive({
    name: null,
    token: null,
  });
  // initial value ..
  if(localStorage.getItem('user')){
    Object.assign(user, JSON.parse(localStorage.getItem('user')));
  }
  watch(user , (newVal) =>{
     localStorage.setItem('user'  ,JSON.stringify(newVal));
  },{
    deep: true
  });
  /*actions*/
  const removeAuth = () =>{
    user.name = null;
    user.token = null;
  }
  /*getters(like computed)*/
  const isAuth = () => {
    return user.token !== null && user.name !== null;
  }

  return {
    user,
    removeAuth,
    isAuth
  }
});

export default useAuthStore;