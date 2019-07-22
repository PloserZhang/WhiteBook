package org.sang.mapper;

import org.apache.ibatis.annotations.Param;
import org.sang.bean.User;

import java.util.List;

/**
 * Created by sang on 2017/12/28.
 */
public interface UserMapper {
    User loadUserByUsername(String username);

    int hrReg(@Param("username") String username, @Param("password") String password);

    List<User> getHrsByKeywords(@Param("keywords") String keywords);

    int updateUser(User hr);

    int deleteRoleByUserId(Long hrId);

    int addRolesForUser(@Param("hrId") Long hrId, @Param("rids") Long[] rids);

    User getUserById(Long hrId);

    int deleteUser(Long hrId);

    List<User> getAllUser(@Param("currentId") Long currentId);
}
