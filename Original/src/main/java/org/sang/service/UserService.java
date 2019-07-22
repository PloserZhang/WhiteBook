package org.sang.service;

import org.sang.bean.User;
import org.sang.common.UserUtils;
import org.sang.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Created by sang on 2017/12/28.
 */
@Service
@Transactional
public class UserService implements UserDetailsService {

    @Autowired
    UserMapper userMapper;

    @Override
    public UserDetails loadUserByUsername(String s) throws UsernameNotFoundException {
        User hr = userMapper.loadUserByUsername(s);
        if (hr == null) {
            throw new UsernameNotFoundException("用户名不对");
        }
        return hr;
    }

    public int hrReg(String username, String password) {
        //如果用户名存在，返回错误
        if (userMapper.loadUserByUsername(username) != null) {
            return -1;
        }
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String encode = encoder.encode(password);
        return userMapper.hrReg(username, encode);
    }

    public List<User> getHrsByKeywords(String keywords) {
        return userMapper.getHrsByKeywords(keywords);
    }

    public int updateHr(User hr) {
        return userMapper.updateUser(hr);
    }

    public User getHrById(Long hrId) {
        return userMapper.getUserById(hrId);
    }

    public int deleteHr(Long hrId) {
        return userMapper.deleteUser(hrId);
    }

    public List<User> getAllHrExceptAdmin() {
        return userMapper.getAllUser(UserUtils.getCurrentUser().getId());
    }
    public List<User> getAllHr() {
        return userMapper.getAllUser(null);
    }
}
