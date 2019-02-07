import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import Vue from "vue";
import MyTask from "../../client/app/service/standards/myTasks/hoge.vue";

const should = chai.should();
chai.use(sinonChai);


describe("hogehoge", () => {
	before((done) => {
		console.log('before');
		done();
	});
  
	it('should be done successfull', () => {
		// const comp = new Vue(MyTask).$mount();
		const defaultData = MyTask.data()
	
		// const Constructor = Vue.extend(MyTask);
		// const vm = new Constructor({ propsData: propsData }).$mount();

		console.log('it1', defaultData);
	});
  
	it('should be done successfull', () => {
	  console.log('it2');
	});
});
