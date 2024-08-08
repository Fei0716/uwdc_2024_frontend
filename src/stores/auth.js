import {defineStore} from 'pinia';
import {reactive,watch} from 'vue';

const useAuthStore = defineStore('auth' , ()=>{
  /*state*/
  const user = reactive({
    name: '',
    id: 0,
  });

  // initial value ....
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
    user.name = '';
    user.id = 0;
  }
  /*getters(like computed)*/
  const isAuth = () => {
    return user.name !== null && user.id !== null;
  }

  return {
    user,
    removeAuth,
    isAuth
  }
});

export default useAuthStore;