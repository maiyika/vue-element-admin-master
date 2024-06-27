import { asyncRoutes, constantRoutes } from '@/router'
import { getMenuList } from '@/api/user'
import Layout from '@/layout'
/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    //console.log("hasPermission(roles, tmp):",hasPermission(roles, tmp))
    if (hasPermission(roles, tmp)) {
      let component=tmp.component
      if(route.component){
        if(component==="Layout"){               //如果是Layout组件，就直接引入Layout组件
          tmp.component=Layout
        }else{
          tmp.component=(resolve) => require([`@/views${component}`], resolve)   //否则就动态引入组件
        }
      }
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise((resolve, reject) => {
      getMenuList().then(response=>{
        if(response.code==200){    //获取用户菜单列表成功
          const accessedRoutes = filterAsyncRoutes(response.data, roles)
          commit('SET_ROUTES', accessedRoutes)
          resolve(accessedRoutes)
        }else{
          reject(response.msg)    //获取用户菜单列表失败
        }
      }).catch(error=>{
        reject(error)
      })
      /* let accessedRoutes
      if (roles.includes('admin')) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes) */
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
